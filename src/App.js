import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import EditOb from "./components/EditOb";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<div className="NA">No Obituary Yet</div>}></Route>
          <Route path="/create" element={<EditOb/>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
