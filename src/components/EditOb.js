import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import  axios  from "axios";
import Ob from "../Ob.png";
const EditOb = () => {
    const navigate = useNavigate();
    const [obs, setObs] = useOutletContext()[0];
    const time = new Date();
    const [fileName, setFileName] = useState(null)
    const [id, setID] = useOutletContext()[1];
    const [populated, setPopulated] = useOutletContext()[2];
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [born, setBorn] = useState("");
    const [died, setDied] = useState(() => new Date(time.getTime() - time.getTimezoneOffset() * 60000).toISOString().slice(0, 19));

    function returnHome() {
        navigate("/");
    }
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    
    const formatDate = (when) => {
        const formatted = new Date(when).toLocaleString("en-US", options);
        if (formatted === "Invalid Date") {
            console.log("date invalid");
            return "";
        }
        return formatted;
    };

    // Need a way of keeping the obituary card extended when creating, but un-extending on refresh
    async function handleSave() {
        setBorn(formatDate(born));
        setDied(formatDate(died));
        console.log(image);
        console.log(name);
        console.log(born);
        console.log(died);
        console.log(id);
        if (!inputValid()) {
            setLoading(true);
            const data = new FormData();
            setDied(formatDate(died))
            setBorn(formatDate(born))
            data.append("image", image);
            data.append("name", name);
            data.append("born", formatDate(born));
            data.append("died", formatDate(died));
            data.append("id", id);
            try {
                const responsePost = await axios.post(
                    "https://qauzveiybakp6h42xomb6kpjbe0boool.lambda-url.ca-central-1.on.aws/",
                    data
                );
                console.log(responsePost);
                const responseGet = await  axios.get('https://sxpmm6g35ephjnluz2stawhh7a0lvewi.lambda-url.ca-central-1.on.aws/');
                console.log(responseGet); 
                const res = JSON.stringify(responseGet.data);
                setObs(JSON.parse(res));

                if (!populated) {
                    setPopulated(true);
                }
                navigate("/");
            } catch (error) {
                console.log(error) 
                alert("an error occured")
                
            } finally {
                setLoading(false);
            }
            
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
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        if (file) {
            setFileName(file.name);
            setImage(file);
        } else {
            setFileName(null);
        }
    };
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
                        <label for="file-upload" className="custom-file-upload">
                            <p>
                                Select and image for the deceased{' '}
                                {fileName && <span className="highlight">({fileName})</span>}
                            </p>
                        </label>
                        <input type="file" accept=".png, .jpg, .jpeg" id="file-upload" onChange={handleFileChange}/>
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