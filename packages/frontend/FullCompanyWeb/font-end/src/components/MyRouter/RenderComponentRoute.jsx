import { render } from 'react-dom';
import React, { Component, useContext, useEffect } from 'react';
import { createBrowserHistory } from 'history';

class Inner extends Component {
    render() {
        return (
            <div>
                内部的东西 {this.props.p1}
            </div>
        )
    }
}

const _location = { currentURL: 'XXXXX' };
const RouterContext = React.createContext(_location);
// 生成 <a></a>

function Link(props) {
    return (
        <a href={props.to} onClick={(e) => { e.preventDefault() }}>
            {props.children}
        </a>
    )
}

// React.createElement(component, props, ...children)

function RenderComponentRoute(props) {
    const { match, component, path, render, children } = props;

    const routeValue = useContext(RouterContext);
    if (routeValue === "xxx") {
        if (match) {
            return React.createElement(component);
        }
        if (children) {
            return <>{children}</>
        }
        if (render) {
            return render(render);
        }

    }

    return (
        <div>
            route does not match, nothing is created
        </div>
    )
}

//


function TestContextConsumer() {
    const answer = useContext(RouterContext);
    return (
        <h2>
            answer: {answer.currentURL}
        </h2>

    )
}



function ControllerRouter(props) {
    const { match, component, path, children } = props;

    //useEffect(() => {
    //    effect
    //    return () => {
    //        cleanup
    //    }
    //}, [input])

    return (
        <RouterContext.Provider value={{ currentURL: '22222' }}>
            <TestContextConsumer />
            <hr />
            {children}
        </RouterContext.Provider>
    )
}


export default function Application() {

    let v1 = "假设"
    return (
        <ControllerRouter>

            <div>
                <Link to="/router1">导航至 </Link>
                <h3>test if anything is rendered</h3>
                <hr></hr>
                <RenderComponentRoute path="/route1" >
                    test1
                <Inner />
                </RenderComponentRoute>
                <RenderComponentRoute path="/router2" match={true} component={Inner} />
                <RenderComponentRoute path="/router3" render={() => { return <Inner p1={v1} /> }} />
            </div>
        </ControllerRouter>
    )
}

