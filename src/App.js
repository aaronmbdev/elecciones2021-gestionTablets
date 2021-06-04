import './App.css';
import {Component} from "react";
import "@firebase/database"
import firebase from "@firebase/app";
import {Alert, Badge, Button, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from "moment";
import {FaThumbsUp} from "react-icons/all";
import "leaflet/dist/leaflet.css";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import leaflet from "leaflet";


const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    projectId: process.env.REACT_APP_PROJ_ID,
    databaseURL: process.env.REACT_APP_DB_URL,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
};

const iconPerson = new leaflet.Icon({
    iconUrl: require('./location-pin.svg'),
    iconRetinaUrl: require('./location-pin.svg'),
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
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
        const styleMap = { "width": "100%", "height": "60vh" }
        const getTimeDiff = (data) => {
            let ahora = moment(new Date());
            let antes = moment(moment.unix(data));
            if(ahora.diff(antes,'second',false) > 60) {
                if(ahora.diff(antes,'minute',false) > 60) {
                    return {
                        text: ahora.diff(antes,'hour',false)+" horas",
                        badge: <Badge pill variant="danger">
                            Desconectado
                        </Badge>
                    };
                } else {
                    return {
                        text: ahora.diff(antes,'minute',false)+" minutos",
                        badge: <Badge pill variant="warning">
                            Desconectado
                        </Badge>
                    };
                }
            } else {
                return {
                    text: ahora.diff(antes,'second',false)+ " segundos",
                    badge: <Badge pill variant="success">
                        En línea
                    </Badge>
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
                    <Row>
                        <Col>
                            <Alert variant={"danger"}>
                                El usuario requiere asistencia
                            </Alert>
                        </Col>
                        <Col>
                            <Button variant="success">
                                <FaThumbsUp onClick={() => {
                                    cancelarAsistencia(id)
                                }} />
                            </Button>
                        </Col>
                    </Row>
                );
            }

        }
        const getTablets = () => {
            if(this.state.data !== null) {
                let render = [];
                this.state.data.forEach((e) => {
                    let id = e[0];
                    let data = e[1];
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
    return (

            <div className="App main">
                <Container fluid>
                    <Row>
                        <Col className={"scroll"}>
                            {getTablets()}
                        </Col>
                        <Col xs={8}>
                            <MapContainer
                                style={styleMap}
                                center={[41.373286, 2.151722]}
                                zoom={17}>

                                {renderMarkers()}

                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                />
                            </MapContainer>
                        </Col>
                    </Row>
                </Container>
            </div>

    );
  }
}

export default App;
