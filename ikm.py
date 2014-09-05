import json
import logging

import falcon
import dataset


HIDE_THRES = -10


def get_json(req):
    try:
        data = req.stream.read()
        return json.loads(data.decode("utf8"))
    except ValueError:
        raise falcon.HTTPError(falcon.HTTP_753, 'Malformed JSON')


class ListResource:
    def __init__(self, table):
        self.table = table
        self.logger = logging.getLogger('listapp.' + __name__)

    def on_get(self, req, resp, list_name):
        items = self.table.find(list_name=list_name,
                                order_by="-votes")
        items = filter(lambda i: i["votes"] > HIDE_THRES, items)
        resp.body = json.dumps({"items": list(items)})

    def on_put(self, req, resp, list_name):
        form = get_json(req)
        if "item" not in form:
            raise falcon.HTTPError(falcon.HTTP_422, 'Invalid Data, no item')

        row = dict(list_name=list_name, name=form['item'], votes=0)
        row['id'] = self.table.insert(row)
        resp.body = json.dumps(row)


class ItemResource:
    def __init__(self, table):
        self.table = table
        self.logger = logging.getLogger('listapp.' + __name__)

    def on_get(self, req, resp, list_name, item_id):
        row = self.table.find_one(list_name=list_name, id=item_id)
        self.body = json.dumps(row)

    def on_post(self, req, resp, list_name, item_id):
        form = get_json(req)
        action = form.get("action", None)
        if not action:
            raise falcon.HTTPError(falcon.HTTP_422, 'Invalid Data, no vote')

        row = self.table.find_one(list_name=list_name, id=item_id)
        row['votes'] += 1 if action == 'upvote' else -1
        self.table.update(row, ['id'])

        resp.body = json.dumps(row)


def make_app():
    db = dataset.connect('sqlite:///ikm.db')
    table = db['ikm']
    list_resouce = ListResource(table)
    item_resouce = ItemResource(table)

    app = falcon.API()
    app.add_route('/lists/{list_name}', list_resouce)
    app.add_route('/lists/{list_name}/{item_id}', item_resouce)

    return app


class StaticMiddleware(object):
    def __init__(self, app, root=".", static_url='/'):
        self.app = app
        self.static_url = static_url
        self.root = root
        self.cling = static.Cling(root)

    def __call__(self, environ, start_response):
        path_info = environ.get('PATH_INFO', '')
        valid_extensions = ["js", "css", "html"]
        if path_info == "/":
            path_info = "index.html"
        path_info = path_info.rsplit(".", 1)
        if len(path_info) == 2 and path_info[1] in valid_extensions:
            return self.cling(environ, start_response)
        else:
            return self.app(environ, start_response)

app = make_app()

if __name__ == '__main__':
    from wsgiref import simple_server
    import static
    app = StaticMiddleware(app)
    print("Starting testing server with static serve..")
    httpd = simple_server.make_server('0.0.0.0', 4242, app)
    httpd.serve_forever()
