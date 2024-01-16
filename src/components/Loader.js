import React from 'react'
// import loader from '../images/spin.gif'
// import loader from '../images/spin.rainbow.gif'
import loader from '../images/spin.rainbow.v1r3.gif'

const Loader = ({startTime, message}) => {
    console.log("Loader: ", message)
    return ( <div style={{display:"block", margin:"0 auto"}}>
        <img src={loader} alt={'Loading'} style={{ width:'200px', margin:'auto', display:'block', alt:'Loading'}}/>
        <h4 style={{textAlign:"center", marginTop:0}}>{message}</h4>
        </div>
    )
}

export default Loader