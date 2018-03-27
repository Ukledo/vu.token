/**
*  Usage:
*    let timeMachine = new TimeMachine(web3);
*    var clock; // Clock.sol instance
*
*    before('setup', function(done) {
*      Clock.deployed()
*        .then(_clock => clock = _clock)
*        .then(() => done());
*    });
*
*    it("Jump forward +500 sec", function() {
*     return clock.time.call()
*       .then(_time => initialTime = _time)
*       .then(() => timeMachine.jump(500))
*       .then(() => clock.time.call())
*       .then(_time => assert.isTrue(_time - initialTime >= 500));
*    });

*    it("Jump forward +1 hour", function() {
*     return clock.time.call()
*       .then(_time => initialTime = _time)
*       .then(() => {
*           var currentDate = timeMachine.secondsToDate(initialTime);
*           currentDate.setHours(currentDate.getHours() + 1);
*           return timeMachine.jump(currentDate.getTime() / 1000 - initialTime);
*       })
*       .then(() => clock.time.call())
*       .then(_time => assert.isTrue(_time - initialTime >= 3600));
*     });
*/

/*
*  Time Machine
*/
function TimeMachine(web3) {
    var dTime = 0;

    function send(method, params, callback) {
        if (typeof params == "function") {
            callback = params;
            params = [];
        }

        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: method,
            params: params || [],
            id: new Date().getTime()
        }, callback);
    };

    this.jump = (seconds) => {
        return new Promise(function (resolve, reject) {
            send("evm_increaseTime", [seconds], function(e, result) {
                if (e) reject(e);
                dTime += seconds;

                // Mine a block so new time is recorded.
                send("evm_mine", function(err, result) {
                    if (e) reject(e);

                    web3.eth.getBlock('latest', function(e, block) {
                        if(e) reject(e);
                        resolve();
                    })
                })
            })
        });
    }

    this.secondsToDate = (seconds) => {
        var t = new Date(Date.UTC(1970, 0, 1));
        t.setSeconds(seconds);
        return t;
    }

    // this.reset = (seconds) => {
    //     TODO: negative values are not suported yet
    //     return this.jump(-dTime).then(() => dTime = 0);
    // }
}

module.exports = TimeMachine;
