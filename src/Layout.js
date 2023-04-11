import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
const Layout = () => {
    const [ obs, setObs ] = useState([]);
    const [ id, setId ] = useState();
    const navigate = useNavigate();
    useEffect(() => {
        // fetch on program load
        

    }, [])
    function newOb() {
        const id = uuidv4();
        const template = {
            id: id,
            image:"",
            name:"",
            born:"",
            died:"",
            description:""
        }
        setId(id);
        setObs((prevObs) => {
            return [template, ...prevObs];
        });
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
                <Outlet context={[[obs, setObs], [id, setId]]}/>
            </div>
        </> 
     );
}
 
export default Layout;