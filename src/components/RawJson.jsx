import React from "react";

export default function RawJson ({json}) { return <pre>{JSON.stringify(json,null,2)}</pre> }

