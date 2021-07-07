/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState, useRef } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { API_URL } from '../utils/constants';
import main from '../ccsengine/index';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as fs from 'fs';
import * as path from 'path';
import AppIpfs from '../components/AppIpfs';
import AppSwarm from '../components/AppSwarm';

// import logger from '../ccsengine/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const path = require('path');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const App = (props) => {
    const [file, setFile] = useState(null); // state for storing actual image
    const [previewSrc, setPreviewSrc] = useState(''); // state for storing previewImage
    const [state, setState] = useState({
        title: '',
        description: '',
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isPreviewAvailable, setIsPreviewAvailable] = useState(false); // state to show preview only for images
    const dropRef = useRef(); // React ref for managing the hover state of droppable area

    const handleInputChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value,
        });
    };

    const onFileChange = (e) => {
        const f = e.target && e.target.files && e.target.files[0];

        setFile(f);
    };

    const onDrop = (files) => {
        const [uploadedFile] = files;
        setFile(uploadedFile);

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewSrc(fileReader.result);
        };
        fileReader.readAsDataURL(uploadedFile);
        setIsPreviewAvailable(uploadedFile.name.match(/\.(jpeg|jpg|png)$/));
        dropRef.current.style.border = '2px dashed #e9ebeb';
    };

    const updateBorder = (dragState) => {
        if (dragState === 'over') {
            dropRef.current.style.border = '2px solid #000';
        } else if (dragState === 'leave') {
            dropRef.current.style.border = '2px dashed #e9ebeb';
        }
    };

    const handleOnSubmit = async (event) => {
        event.preventDefault();

        try {
            const { title, description } = state;
            if (title.trim() !== '' && description.trim() !== '') {
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('title', title);
                    formData.append('description', description);

                    setErrorMsg('');
                    await axios.post(`${API_URL}/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    // eslint-disable-next-line react/prop-types
                    props.history.push('/list');
                } else {
                    setErrorMsg('Please select a file to add.');
                }
            } else {
                // setErrorMsg('Please enter all the field values.');
                // 专门用于调试代码
                // node build/src/index.js
                // let c = path.resolve('../../build/ccsengine');
                // console.log('c',main());
                // const filepath = path.join(__dirname, '../../dingwei.png');
                // console.log('const filepath = path.join', filepath);
                // var ccsparas = [
                //     '',
                //     '',
                //     'original vapor minor camera ranch cactus tool guard disagree goddess toward genre',
                //     'wss://rocky-api.crust.network',
                //     filepath,
                // ];
                // console.log(ccsparas);
                // main(ccsparas)['catch'](function (e) {
                //     console.log(e);
                // });
                // setErrorMsg('Show the file path index.ts',main());
            }
        } catch (error) {
            error.response && setErrorMsg(error.response.data);
        }
    };

    return (
        <React.Fragment>
            {/* <div className="App">
                <h1>Upload file to Swarm</h1>
                <form onSubmit={handleSubmit}>
                    <input type="file" name="file" onChange={onFileChange} />
                    <input type="submit" />
                </form>
                {uploading && <code>Uploading...</code>}
                {link && (
                    <code>
                        <a href={link}>{link}</a>
                    </code>
                )}
            </div>
            <h1>Upload file to Crust</h1> */}
            <AppSwarm name="Cahal" />
            <AppIpfs name="Cahal" />
            <Form className="search-form" onSubmit={handleOnSubmit}>
                {errorMsg && <p className="errorMsg">{errorMsg}</p>}
                <Row>
                    <Col>
                        <Form.Group controlId="title">
                            <Form.Control
                                type="text"
                                name="title"
                                value={state.title || ''}
                                placeholder="Enter title"
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="description">
                            <Form.Control
                                type="text"
                                name="description"
                                value={state.description || ''}
                                placeholder="Enter description"
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <div className="upload-section">
                    <Dropzone
                        onDrop={onDrop}
                        onDragEnter={() => updateBorder('over')}
                        onDragLeave={() => updateBorder('leave')}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps({ className: 'drop-zone' })} ref={dropRef}>
                                <input {...getInputProps()} />
                                <p>Drag and drop a file OR click here to select a file</p>
                                {file && (
                                    <div>
                                        <strong>Selected file:</strong> {file.name}
                                    </div>
                                )}
                            </div>
                        )}
                    </Dropzone>
                    {previewSrc ? (
                        isPreviewAvailable ? (
                            <div className="image-preview">
                                <img className="preview-image" src={previewSrc} alt="Preview" />
                            </div>
                        ) : (
                            <div className="preview-message">
                                <p>No preview available for this file</p>
                            </div>
                        )
                    ) : (
                        <div className="preview-message">
                            <p>Image preview will be shown here after selection</p>
                        </div>
                    )}
                </div>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </React.Fragment>
    );
};

export default App;
