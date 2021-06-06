import {Component} from "react";
import "@firebase/database"
import firebase from "@firebase/app";
import {Alert, Badge, Button, Card, Col, Row, Spinner} from "react-bootstrap";
import moment from "moment";
import {FaThumbsUp} from "react-icons/all";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import leaflet from "leaflet";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    projectId: process.env.REACT_APP_PROJ_ID,
    databaseURL: process.env.REACT_APP_DB_URL,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
};

const iconPerson = new leaflet.Icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

export { iconPerson };

class App extends  Component {
    constructor(props) {
        super(props);
        if (!firebase.apps.length){
            firebase.initializeApp(config);
        }
        this.state = {
            data: null
        }

    }

    componentDidMount() {
        let database = firebase.database();
        let rf = database.ref("/registro");
        rf.on("value", (snap) => {
            let items = Object.entries(snap.val());
            this.setState({
                data: items
            })
        });

    }

    render() {
        const styleMap = { "width": "100vw", "height": "100vh" }
        const getTimeDiff = (data) => {
            let ahora = moment(new Date());
            let antes = moment(moment.unix(data));
            if(ahora.diff(antes,'second',false) > 60) {
                if(ahora.diff(antes,'minute',false) > 60) {
                    return {
                        text: ahora.diff(antes,'hour',false)+" horas",
                        badge: <span className="badge badge-pill badge-danger" style={{background:"#b82f2e"}}>Desconectado</span>
                    };
                } else {
                    return {
                        text: ahora.diff(antes,'minute',false)+" minutos",
                        badge: <span className="badge badge-pill badge-warning" style={{background:"#eab42e"}}>Desconectado</span>
                    };
                }
            } else {
                return {
                    text: ahora.diff(antes,'second',false)+ " segundos",
                    badge: <span className="badge badge-pill badge-success" style={{background:"#22a8aa"}}>En línea</span>
                };
            }
        }

        const cancelarAsistencia = (id) => {
            let database = firebase.database();
            let rf = database.ref("/registro/"+id+"/asistencia");
            rf.set(false).then(r => {
                console.log(r);
            });
        }

        const getAsistencia = (get,id) => {
            if(get) {
                return(
                    <div className={"row"}>
                        <div className={"col-md-12"}>
                            <Alert variant={"danger"}>
                                El usuario requiere asistencia
                            </Alert>
                        </div>
                        <div className={"col-md-12"}>
                            <Button variant="success">
                                <FaThumbsUp onClick={() => {
                                    cancelarAsistencia(id)
                                }} />
                            </Button>
                        </div>
                    </div>
                );
            }

        }
        const getTablets = () => {
            if(this.state.data !== null) {
                let render = [];
                this.state.data.forEach((e) => {
                    let id = e[0];
                    let data = e[1];
                    if(data.lastSeen !== undefined) {
                        render.push(
                            <Row>
                                <Col>
                                    <Card  key={id} style={{margin:"20px"}}>
                                        <Card.Header as="h5">Tablet #{id}</Card.Header>
                                        <Card.Body>
                                            <Card.Text>
                                                Estado: {getTimeDiff(data.lastSeen).badge}
                                            </Card.Text>
                                            <Card.Text>
                                                Referencia: {data.usuario}
                                            </Card.Text>
                                            <Card.Text>
                                                Última conexión: hace {getTimeDiff(data.lastSeen).text}
                                            </Card.Text>
                                            {getAsistencia(data.asistencia,id)}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        );
                    } else {
                        render.push(
                            <Row>
                                <Col>
                                    <Card  key={id} style={{margin:"20px"}}>
                                        <Card.Header as="h5">Tablet #{id}</Card.Header>
                                        <Card.Body>
                                            <Card.Text>
                                                Estado: <Badge pill variant="warning">
                                                Registrado
                                            </Badge>
                                            </Card.Text>
                                            <Card.Text>
                                                Referencia: {data.usuario}
                                            </Card.Text>
                                            <Card.Text>
                                                No se están recibiendo datos de localización
                                            </Card.Text>
                                            {getAsistencia(data.asistencia,id)}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        );
                    }
                });
                return render;
            } else {
                return (<Spinner animation="border" variant="danger" />);
            }
        }
        const renderMarkers = () => {
            let items = [];
            if(this.state.data !==null) {
                this.state.data.forEach((e) => {
                    if(e[1].lat !== undefined && e[1].long !== undefined) {
                        items.push(<Marker icon={iconPerson} key={e[0]} position={[e[1].lat,e[1].long]}>
                            <Popup>
                                {e[1].usuario}
                            </Popup>
                        </Marker>);
                    }
                });
            }
            return items;
        }
        const renderMap = () => {
            return(<MapContainer
                style={styleMap}
                center={[41.373286, 2.151722]}
                zoom={17}>

                {renderMarkers()}

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
            </MapContainer>);
        }
    return (

            <div className="App main">

                    <div className={"row"}>
                        <div id="panel" className={"col-md-3 scroll"}>
                            {getTablets()}
                        </div>
                        <div className={"col-md-8"}>
                            {renderMap()}
                        </div>
                    </div>
            </div>

    );
  }
}

export default App;
