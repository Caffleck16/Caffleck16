import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import  axios  from "axios";
import Ob from "../Ob.png";
const EditOb = () => {
    const navigate = useNavigate();
    const [obs, setObs] = useOutletContext()[0];
    const [id, setID] = useOutletContext()[1];
    const [populated, setPopulated] = useOutletContext()[2];
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [born, setBorn] = useState("");
    const [died, setDied] = useState("");
    function returnHome() {
        navigate("/");
    }
    function handleSave() {
        if (!inputValid()) {
            setLoading(true);
            const data = new FormData();
            data.append("image", image)
            data.append("name", name)
            data.append("born", born)
            data.append("died", died)
            data.append("id", id)
            // Should born and died be formatted here to be the correct date type?
            axios.post(
                "https://qauzveiybakp6h42xomb6kpjbe0boool.lambda-url.ca-central-1.on.aws/",
                data
            )
            .then((response) => {
                console.log(response);
            }, (error) => {
                console.log(error);
            });
            setLoading(false);
            // two ideas: call a function that lives in Layout to fetch data or do it right here right now.
            axios.get('https://sxpmm6g35ephjnluz2stawhh7a0lvewi.lambda-url.ca-central-1.on.aws/')
            .then((response) => {
                console.log(response);
                const res = JSON.stringify(response.data);
                setObs(JSON.parse(res));
            }, (error) => {
                console.log(error);
            });
            if (!populated) {
                setPopulated(true);
            }
            navigate("/");
        }
        
    }
    function inputValid() {
        console.log("testing input");
        if (name === "" || died === "" || born === "") {
            console.log("input incorrect");
            return true;
        }
        if (image === '' || image === null) {
            console.log("no image")
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
                <form className="input-holder" id="formElem">
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