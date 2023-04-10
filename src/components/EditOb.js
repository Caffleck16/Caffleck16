import { useNavigate } from "react-router-dom";
import Ob from "../Ob.png";
const EditOb = () => {
    const navigate = useNavigate();
    function returnHome() {
        navigate("/");
    }
    return ( 
        <>
            <div className="create">
                <div>
                    <h1>Create a New Obituary</h1>
                </div>
                    <img className="textHolder" src={Ob}/> 
                <div>
                    <input type="file"></input>
                </div>
                <div>
                    <input type="name"></input>
                </div>
                <div>
                    <input type="datetime-local"></input>
                </div>
            </div>
        </>

     );
}
 
export default EditOb;