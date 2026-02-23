"use client"

import SwaggerUI from "swagger-ui-react"
import "swagger-ui-dist/swagger-ui.css"
import "./swagger-light.css"

export default function DocsPage() {
    return (
        <div style={{ background: "white", minHeight: "100vh", padding: 24 }}>
            <SwaggerUI url="/api/openapi" />
        </div>
    )
}
