import Markdown from "react-markdown";
import React from "react";

export default function IareMarkdown({ content }: any) {
    return <Markdown
        components={{
            a: ({ node, ...props }) => (
                <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                />
            ),
        }}
    >
        {content}
    </Markdown>
}