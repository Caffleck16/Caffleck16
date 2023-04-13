import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Ob from "./components/Ob"
import axios from "axios";
const Layout = () => {
    const [ obs, setObs ] = useState([]);
    const [ id, setId ] = useState();
    const [ populated, setPopulated ] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        // fetch on program load
        axios.get('https://sxpmm6g35ephjnluz2stawhh7a0lvewi.lambda-url.ca-central-1.on.aws/')
        .then((response) => {
            console.log(response);
            const data = JSON.stringify(response.data)
            setObs(JSON.parse(data))
        }, (error) => {
            console.log(error);
        });
        console.log(obs.length);
        if (obs.length > 0) {
            setPopulated(true);
        }
    }, [])
    function newOb() {
        const id = uuidv4();
        setId(id);
        navigate('/create');
    }
    return (
        <>
            <div id= "title">
                {/* this is just for spacing purposes */}
                <h1>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h1> 
                <h1>The Last Show</h1>
                <div id = "new-ob" onClick={newOb}>
                    <label>+ New Obituary</label>
                </div>
            </div>
            <div className="content">
                <Outlet context={[[obs, setObs], [id, setId], [populated, setPopulated]]}/>
            </div>
            <div className="obituaries">
                {
                    populated ? <div className="NA">No Obituary Yet</div> :
                    obs.map((ob) => (
                        <Ob
                            id = {ob.id}
                            name = {ob.name}
                            born = {ob.born_year}
                            died = {ob.died_year}
                            image_url = {ob.image_url}
                            obituary = {ob.obituary}
                            speech_url = {ob.speech_url}
                        /> 
                    ))
                }
            </div>
        </> 
     );
}
 
export default Layout;