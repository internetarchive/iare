import React, {useState} from "react";
import RefView from "../v2/RefView/RefView";
import refDetails from "../../__tests__/test_data/801c98d5.ref.harvard.json";
export default function TestRefModal( props ) {
    const [openModal, setOpenModal] = useState(false)

    return <>
        <button onClick={(e) => setOpenModal(true)}>test ref</button>
        <div className={"iari-vTest"}>
            <RefView open={openModal} onClose={() => setOpenModal(false)} details={refDetails} />
        </div>
    </>
}
