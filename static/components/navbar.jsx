/**
 * @jsx React.DOM
 */
'use strict';

define(function (require, exports) {
    var React = require('react');
    var Bootstap = require('react-bootstrap');
    var Nav = Bootstap.Nav;
    var Navbar = Bootstap.Navbar;
    var NavItem = Bootstap.NavItem;
    var Input = Bootstap.Input;
    var Button = Bootstap.Button;

    var navigate = require('react-mini-router').navigate;

    var SelectList = React.createClass({
        getInitialState: function() {
            return {input: ""}
        },
        onChange: function(event) {
            var userInput = event.target.value;
            this.setState({input: userInput});
        },
        onSubmit: function(event) {
            event.preventDefault();
            var list = this.state.input;
            this.setState({input: ""});
            if(list !== "")
                navigate("/lists/" + list);
        },
        onRandom: function(event) {
            var list = Math.random().toString(36).substring(2);
            this.setState({input: list});
        },
        render: function() {
            return (<form className="navbar-form navbar-right" onSubmit={this.onSubmit}>
                      <div className="col-lg-6">
                        <div className="input-group">
                          <Input type="text"
                                 onChange={this.onChange}
                                 className="form-control"
                                 placeholder="Create new list"
                                 value={this.state.input} />
                          <span className="input-group-btn">
                            <Button onClick={this.onSubmit} bsStyle="primary">Go</Button>
                            <Button onClick={this.onRandom} bsStyle="danger">Rnd</Button>
                          </span>
                        </div>
                      </div>
                    </form>)
        }
    });

    var AppNavBar = React.createClass({
        render: function() {
            var list = this.props.list;
            var bar = (
                <div className="navbar navbar-inverse">
                  <div className="navbar-header">
                    <a className="navbar-brand" key={1} href={"/lists/"+list}><span className="name">IKM</span> - {list}</a>
                  </div>
                  <SelectList list={this.props.list}/>
                </div>
            );
            return <div>{bar}</div>
        }
    });


    exports.AppNavBar = AppNavBar;
});
