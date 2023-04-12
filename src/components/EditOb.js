import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import  axios  from "axios";
import Ob from "../Ob.png";
const EditOb = () => {
    const navigate = useNavigate();
    var [obs, setObs] = useOutletContext()[0]; // probably not needed
    const [id, setID] = useOutletContext()[1];
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [born, setBorn] = useState("");
    const [died, setDied] = useState("");
    var curOb = {
        image:"",
        name:"",
        born:"",
        died:"",
        id:""
    }
    function returnHome() {
        navigate("/");
    }
    function handleSave() {
        if (!inputValid()) {
            setLoading(true);
            curOb.image = image;
            curOb.name = name;
            curOb.born = born;
            curOb.died = died;
            curOb.id = id;
            axios.post(
                "https://qauzveiybakp6h42xomb6kpjbe0boool.lambda-url.ca-central-1.on.aws/",
                curOb
            )
            .then((response) => {
                console.log(response);
            }, (error) => {
                console.log(error);
            });
            setLoading(false);
            // two ideas: call a function that lives in Layout to fetch data or do it right here right now.
            navigate("/home");
        }
        
    }
    function inputValid() {
        console.log("testing input");
        if (name === "" || died === "" || born === "") {
            console.log("input incorrect");
            return true;
        }
        if (image === '' || image === null) {
            return true;
        }
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
                        <input type="file" accept=".png, .jpg, .jpeg" id="file-upload" onChange={(e) => setImage(e.target.value)}/>
                    </div>
                    <div className="edit-name">
                        <input type="name" placeholder="Name of the deceased" onChange={(e) => setName(e.target.value)} required></input>
                    </div>
                    <div className="edit-date">
                        <p><i>Born:&nbsp;&nbsp;&nbsp;</i></p>
                        <input type="datetime-local" value={ born } onChange={(e) => setBorn(e.target.value)} required></input>
                        <p><i>&nbsp;&nbsp;&nbsp;Died:&nbsp;&nbsp;&nbsp;</i></p>
                        <input type="datetime-local" value={ died }onChange={(e) => setDied(e.target.value)} required></input>
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