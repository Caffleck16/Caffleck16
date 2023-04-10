import { Outlet, useNavigate } from "react-router-dom";
const Layout = () => {
    const navigate = useNavigate();
    function newOb() {
        navigate('/create');
    }
    return (
        <>
            <div id= "title">
                {/* this is just for spacing purposes */}
                <h1>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h1> 
                <h1>The Last Show</h1>
                <div id = "new-ob" onClick={newOb}>
                    <label>+ New Obitiuary</label>
                </div>
            </div>
            <div className="content">
                <Outlet/>
            </div>
        </> 
     );
}
 
export default Layout;