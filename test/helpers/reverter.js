function Reverter(web3) {
    const self = this

    this.snapshotId = 0;

    this.revert = (done, id) => {
        let toSnapshotId = (id !== undefined) ? id : this.snapshotId

        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_revert",
            id: new Date().getTime(),
            params: [toSnapshotId]
        }, (err, result) => {
            if (err) {
                done(err);
            }
            else {

                self.snapshot(done);
            }
        });
    };

    this.snapshot = (done) => {

        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_snapshot",
            id: new Date().getTime()
        }, (err, result) => {
            if (err) {
                done(err);
            }
            else {
                self.snapshotId = web3.toDecimal(result.result);
                done();
            }
        });
    };

    this.promisifyRevert = async (id) => {
        return new Promise((resolve, reject) => {
            self.revert((err) => {
                if (err) {
                    return reject(err)
                }
                resolve()
            }, id)
        })
    }

    this.promisifySnapshot = async () => {
        return new Promise((resolve, reject) => {
            self.snapshot((err) => {
                if (err) {
                    return reject(err)
                }
                resolve()
            })
        })
    }
}

module.exports = Reverter;
