import React from 'react'
import loader from '../images/spinny2.gif'

const Loader = ({startTime, message}) => {
    console.log("Loader: ", message)
    return ( <div style={{display:"block", margin:"0 auto"}}>
        <img src={loader} alt={'Loading'} style={{ width:'200px', margin:'auto', display:'block', alt:'Loading'}}/>
        <h4 style={{textAlign:"center", marginTop:0}}>{message}</h4>
        </div>
    )
}

export default Loader