import React, { FunctionComponent } from 'react'
import Container from 'react-bootstrap/Container'
import styles from './index.module.scss'

function Page() {
    return (
        <Container as="main" fluid="lg">
            <h1 className={styles.title}>Under construction</h1>
        </Container>
    )
}

export default Page as FunctionComponent
