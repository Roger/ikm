/**
 * @jsx React.DOM
 */
'use strict';

require.config({
  baseUrl: "/static/",
  paths: {
    "react": "bower_components/react/react",
    "react-mini-router": "bower_components/react-mini-router/dist/react-mini-router",
    "react-bootstrap": "bower_components/react-bootstrap/react-bootstrap.min",
    "superagent": "bower_components/superagent/superagent"
  }
});


define(function (require, exports) {
    var React = require('react');
    var RouterMixin = require('react-mini-router').RouterMixin;

    var AppNavBar = require('components/navbar').AppNavBar;
    var List = require('components/list').List;

    var App = React.createClass({
      routes: {
          '/': 'viewDefaultList',
          '/lists/:id': 'viewList'
      },
      mixins: [RouterMixin],
      render: function() {
        return this.renderCurrentRoute();
      },
      viewDefaultList: function() {
          return this.viewList("default");
      },
      viewList: function(list) {
          return (<div>
                    <AppNavBar list={list} />
                    <List list={list} />
                  </div>);
      }
    });

    React.renderComponent(
        App(),
        document.getElementById('content')
    );
});
