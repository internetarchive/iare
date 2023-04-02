import React from 'react'
import loader from '../images/spin.gif'

const Loader = ({startTime, message}) => {
    return ( <div style={{display:"block", margin:"auto"}}>
        <img src={loader} alt={'Loading'} style={{ width:'200px', margin:'auto', display:'block', alt:'Loading'}}/>
        <h4 style={{textAlign:"center", marginTop:0}}>{message}</h4>
        </div>
    )
}

export default Loader