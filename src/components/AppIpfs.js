/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-console */
'use strict';

import { Component, createRef } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import uploadFileToCrust from '../ccsengine/index';

class AppIpfs extends Component {
    constructor() {
        super();
        this.state = {
            added_file_hash: null,
        };

        // bind methods
        this.captureFile = this.captureFile.bind(this);
        this.saveToIpfs = this.saveToIpfs.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.connect = this.connect.bind(this);
        this.multiaddr = createRef();
    }

    captureFile(event) {
        event.stopPropagation();
        event.preventDefault();
        if (document.getElementById('keep-filename').checked) {
            this.saveToIpfsWithFilename(event.target.files);
        } else {
            this.saveToIpfs(event.target.files);
        }
    }

    // Example #1
    // Add file to IPFS and return a CID
    async saveToIpfs([file]) {
        try {
            // 1. 上传文件到IPFS成功的话，会更新页面
            const added = await this.state.ipfs.add(file, {
                progress: (prog) => console.log(`received: ${prog}`),
            });
            console.log(added);
            this.setState({ added_file_hash: added.cid.toString() });
            // 2. 创建存储订单
            this.createCcsOrder(added);
        } catch (err) {
            console.error(err);
        }
    }

    // Example #2
    // Add file to IPFS and wrap it in a directory to keep the original filename
    async saveToIpfsWithFilename([file]) {
        const fileDetails = {
            path: file.name,
            content: file,
        };
        const options = {
            wrapWithDirectory: true,
            progress: (prog) => console.log(`received: ${prog}`),
        };

        try {
            const added = await this.state.ipfs.add(fileDetails, options);
            console.log('log added file info');
            console.log(added);
            // 1. 上传文件到IPFS成功的话，会更新页面
            this.setState({ added_file_hash: added.cid.toString() });
            // 2. 创建存储订单
            this.createCcsOrder(added);
        } catch (err) {
            console.error(err);
        }
    }

    async createCcsOrder(added) {
        const fileInfo = {
            cid: added.cid.toString(),
            size: added.size,
        };

        // // 2. 创建存储订单
        var ccsparas = [
            '',
            '',
            'original vapor minor camera ranch cactus tool guard disagree goddess toward genre',
            'wss://rocky-api.crust.network',
            fileInfo.cid,
            fileInfo.size,
        ];
        console.log(ccsparas);
        uploadFileToCrust(ccsparas)['catch'](function (e) {
            console.log(e);
        });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    async connect() {
        this.setState({
            ipfs: ipfsHttpClient(this.multiaddr.current.value),
        });
    }

    render() {
        if (this.state.ipfs) {
            return (
                <div>
                    <form id="capture-media" onSubmit={this.handleSubmit}>
                        <input type="file" name="input-file" id="input-file" onChange={this.captureFile} />
                        <br />
                        <label htmlFor="keep-filename">
                            <input type="checkbox" id="keep-filename" name="keep-filename" /> keep filename
                        </label>
                    </form>
                    <div>
                        <a
                            id="gateway-link"
                            target="_blank"
                            href={'https://ipfs.io/ipfs/' + this.state.added_file_hash}
                            rel="noreferrer"
                        >
                            {this.state.added_file_hash}
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ textAlign: 'center' }}>
                <h1>Enter the multiaddr for an IPFS node HTTP API</h1>
                <form>
                    <input id="connect-input" type="text" defaultValue="/ip4/127.0.0.1/tcp/5001" ref={this.multiaddr} />
                    <input id="connect-submit" type="button" value="Connect" onClick={this.connect} />
                </form>
            </div>
        );
    }
}
export default AppIpfs;
