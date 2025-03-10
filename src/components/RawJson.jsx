import React from "react";

export default function RawJson ({obj}) { return <pre>{JSON.stringify(obj,null,2)}</pre> }

