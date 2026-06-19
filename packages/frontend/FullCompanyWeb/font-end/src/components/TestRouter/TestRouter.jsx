import React, { Component, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useMatch, Redirect } from "react-router-dom";

function Page1() {
    return <h1>Page1 Page1 Page1 Page1</h1>;
}

function Page2() {
    return <h1>Page2 Page2 Page2 Page2</h1>;
}
function Page3() {
    return <h1>Page3 Page3 Page3 Page3</h1>;
}
function Page4() {
    return <h1>Page4 Page4 Page4 Page4</h1>;
}

function Inner() {
    let { id } = useParams();

    useEffect(() => {
        console.log("test" + id);
    }, [""]);

    return <div>Inner: id: {id}</div>;
}

function ErrorPage(){
    return(
        <h1>Sorry,还没准备好!</h1>
    )
}

function WithNestedLink() {
    let match = useMatch();

    return (
        <div>
            <h2> 带有参数 嵌套式的 路由</h2>
            <br />

            <Link to={`${match.url}/nest1`}>Children 1</Link>
            <br />

            <Link to={`${match.url}/nest2`}>Children 2</Link>
            <br />

            <Link to={`${match.url}/nest3`}>Children 3</Link>
            <br />

            <Route exact path={`${match.path}`}>
                选择一个
            </Route>

            <Route path={`${match.path}/:id`}>
                <Inner />
            </Route>
        </div>
    );
}

// /localhost:3000/admin
function AdminPage() {
    return <h1>后台页面 需要登陆才能 显示</h1>;
}

function LoginPage() {
    return (
        <div
            style={{
                left: "50%",
                top: "50%",
                position: "absolute",
                width: "200px",
                height: "100px",
                marginLeft: "-200px",
                marginTop: "-100px",
            }}
        >
            <label id="name-label" for="">
                name
            </label>{" "}
            <input for="name-label" type="text"></input>
            <br />
            <label id="password-label" for="">
                password
            </label>{" "}
            <input for="password-label" type="password"></input>
            <br />
            <button>登陆</button>
        </div>
    );
}

function PublicPage(params) {
    return (
        <div>
            <ul>
                <li>
                    <Link to="/1">page1</Link>
                </li>
                <li>
                    <Link to="/2">page2</Link>
                </li>
                <li>
                    <Link to="/3">page3</Link>
                </li>
                <li>
                    <Link to="/4">page4</Link>
                </li>
                <li>
                    <Link to="/nest">nest</Link>
                </li>
                <li>
                    <Link to="/login">登陆后台页面</Link>
                </li>
            </ul>

            <hr />
            <h1>公共页面 谁都可以看到</h1>
        </div>
    );
}

const loggedIn = false;

export default class TestRouter extends Component {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route  path="/" element={<WithNestedLink/>} errorElement={<ErrorPage/>}>
                        <Route index element={<WithNestedLink />} />
                        <Route path="a/:id" element={<Page1 />} />
                        <Route path="a/:id" element={<Page2 />} />
                        <Route path="a/:id" element={<Page3 />} />
                        <Route path="a/:id" element={<Page4 />} />
                    </Route>
                    <Route path="/B" errorElement={<ErrorPage/>}>
                        <Route index element={<Page2 />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        );
    }
}
