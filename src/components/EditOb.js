import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import  axios  from "axios";
import Ob from "../Ob.png";
const EditOb = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    var [obs, setObs] = useOutletContext()[0];
    const [id, setID] = useOutletContext()[1];
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState();
    const [name, setName] = useState();
    const [born, setBorn] = useState();
    const [died, setDied] = useState();
    var curOb = {
        image:null,
        name:null,
        born:null,
        died:null,
        description:null
    }
    function returnHome() {
        navigate("/");
    }
    // for (var i in obs) {
    //     if (obs[i].id === id) {
    //         curOb = obs[i];
    //     }
    // }
    function handleSave() {
        if (inputValid()) {
            setLoading(true);
            setPrompt("write an obituary about a fictional character named " + {name} + " who was born on " + {born} + " and died on " + {died} + " .")
            axios
                .post("/chat", { prompt })
                .then((res) => {

                    setResponse(res.data);
                })
                .catch((err) => {
                    console.error(err);
                });
            
            curOb.image = image;
            curOb.name = name;
            curOb.born = born;
            curOb.died = died;
            curOb.description = response;
            console.log(loading);
        }
        
    }
    function inputValid() {
        console.log("testing input");
        console.log("input incorrect");
        return false;
    }
    return ( 
        <>
            <div className="create">
                <div className="exit">
                    <label onClick={returnHome}>X</label>
                </div>
                <form className="input-holder">
                    <div className="edit-title">
                        <h1>Create a New Obituary</h1>
                    </div>
                        <img className="textHolder" src={Ob} alt=""/> 
                    <div className="edit-file">
                        <label for="file-upload" class="custom-file-upload">
                            <p>Select an image for the deceased</p>
                        </label>
                        <input type="file" id="file-upload" onChange={(e) => setImage(e.target.value)}/>
                    </div>
                    <div className="edit-name">
                        <input type="name" placeholder="Name of the deceased" onChange={(e) => setName(e.target.value)} required></input>
                    </div>
                    <div className="edit-date">
                        <p><i>Born:&nbsp;&nbsp;&nbsp;</i></p>
                        <input type="datetime-local" onChange={(e) => setBorn(e.target.value)} required></input>
                        <p><i>&nbsp;&nbsp;&nbsp;Died:&nbsp;&nbsp;&nbsp;</i></p>
                        <input type="datetime-local" onChange={(e) => setDied(e.target.value)} required></input>
                    </div>
                    <div>
                    { loading ? <div className="loading">Please wait. It's not like they're gonna be late for something ...</div> :
                        <button className="submit" onClick={handleSave} type="submit"><label>Write Obitiuary</label></button>
                    }
                    </div>
                </form>
                
            </div>
        </>

     );
}
 
export default EditOb;