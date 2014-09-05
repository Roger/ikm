/**
 * @jsx React.DOM
 */
'use strict';

define(function (require, exports) {
    var React = require('react');
    var superagent = require('superagent');

    var Bootstap = require('react-bootstrap');
    var Input = Bootstap.Input;
    var Button = Bootstap.Button;

    var Item = React.createClass({
        onVoteUp: function(event) {
            this.props.onVote(true);
        },
        onVoteDown: function(event) {
            this.props.onVote(false);
        },
        render: function() {
            var id = this.props.id;
            var name = this.props.name;
            var votes = this.props.votes;
            return(<div className="item">
                <div onClick={this.onVoteUp} className="up"><i className="glyphicon glyphicon-arrow-up"/></div>
                <div><span className="votes">{votes}</span> <span className="name">{name}</span></div>
                <div onClick={this.onVoteDown} className="down"><i className="glyphicon glyphicon-arrow-down"/></div>
            </div>)
        }
    });

    var List = React.createClass({
        getInitialState: function() {
            return {
                items: []
            }
        },
        getList: function(list) {
            superagent.get('/lists/'+list, function(res){
                this.setState({items: res.body.items});
            }.bind(this));
        },
        componentWillMount: function() {
            this.getList(this.props.list);
        },

        componentWillReceiveProps: function(nextProps) {
            if(nextProps.list !== this.props.list)
                this.getList(nextProps.list);
        },

        onVote: function(list, item, upvote) {
            superagent
                .post('/lists/'+list+'/'+item)
                .send({action: upvote ? "upvote" : "downvote"})
                .end(function(res){
                    if(list === this.props.list) {
                        this.getList(list);
                    }
                }.bind(this));
        },

        onNewItem: function(event) {
            event.preventDefault();
            var item = this.state.input;
            var list = this.props.list;
            if(item) {
                this.setState({input: ""})
                superagent
                    .put('/lists/'+list)
                    .send({item: item})
                    .end(function(res){
                        this.getList(list);
                    }.bind(this));
                }
        },

        onInputChange: function(event) {
            this.setState({input: event.target.value})
        },

        render: function() {
            var items = this.state.items.map(function(item) {
                var vote = function(upvote) {
                    this.onVote(this.props.list, item.id, upvote);
                }.bind(this);
                return <Item onVote={vote} key={item.id} name={item.name} votes={item.votes}/>
            }.bind(this));

            return (
                <div className="item-list">
                  <form className="form col-lg-4" onSubmit={this.onNewItem}>
                    <div className="input-group">
                      <Input type="text"
                             onChange={this.onInputChange}
                             className="form-control"
                             value={this.state.input}
                             placeholder="Add item to this list"/>
                      <span className="input-group-btn">
                        <Button onClick={this.onNewItem} bsStyle="primary">Add</Button>
                      </span>
                    </div>
                  </form>
                  {items}
                </div>
            );
        }
    });

    exports.List = List;
});
