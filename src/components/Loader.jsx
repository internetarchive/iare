import React from 'react'
// import loader from '../images/spin.gif'
// import loader from '../images/spin.rainbow.gif'
import loaderImage from '../images/spin.rainbow.v1r3.gif'

const Loader = ({startTime, message}) => {
    console.log("Loader: ", message)
    return (
        <div className={"loader-image"} style={{display:"block", margin:"0 auto"}}>
            <img src={loaderImage}
                 alt={'Loading'}
                 style={{
                     width: '200px',
                     margin: 'auto',
                     display: 'block',
                     alt: 'Loading'
            }}/>
            <h4 style={{
                textAlign: "center",
                marginTop: 0
            }}>{message}</h4>
        </div>
    )
}

export default Loader