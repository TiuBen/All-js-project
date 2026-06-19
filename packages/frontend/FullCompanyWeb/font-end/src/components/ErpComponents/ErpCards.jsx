import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function ErpCards(props) {
    const { name, type, backgroundImage, link, linkTitle } = props;

    return (
        <div className="card d-flex flex-row justify-content-stretch align-items-center" style={{ width: "18rem",height: "10rem" }}>
            <div className="d-flex justify-content-center flex-grow-0 p-4" style={{ width: "rem" }}>
                <i
                    className={`bi ${backgroundImage} align-middle`}
                    style={{ fontSize: "2rem", color: "cornflowerblue" }}
                ></i>
            </div>
            <div className=" d-flex flex-column flex-grow-1 p-4">
                <h2 className="card-text text-center  text-success bg-light font-weight-bold">{name}</h2>
                <h4 className="card-text text-info font-weight-bold">{type}</h4>
                <Link to={link} className="btn btn-outline-primary">
                    {linkTitle}
                </Link>
            </div>
        </div>
    );
}

export default ErpCards;
