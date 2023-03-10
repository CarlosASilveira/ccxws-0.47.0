"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-sparse-arrays */
const CircularBuffer_1 = require("../../src/flowcontrol/CircularBuffer");
const chai_1 = require("chai");
describe("CircularBuffer", () => {
    it("empty read returns undefined", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.read()).to.be.undefined;
    });
    it("empty read after values", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        sut.write(1);
        chai_1.expect(sut.read()).to.equal(1);
        chai_1.expect(sut.read()).to.be.undefined;
    });
    it("multi enq/deq", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        sut.write(0);
        sut.write(1);
        chai_1.expect(sut.read()).to.equal(0);
        chai_1.expect(sut.read()).to.equal(1);
    });
    it("multi enq/deq max", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        sut.write(0);
        sut.write(1);
        sut.write(2);
        chai_1.expect(sut.read()).to.equal(0);
        chai_1.expect(sut.read()).to.equal(1);
        chai_1.expect(sut.read()).to.equal(2);
    });
    it("multi enq/deq repeatedly", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        for (let i = 0; i < 1024; i++) {
            sut.write(0);
            sut.write(1);
            chai_1.expect(sut.read()).to.equal(0);
            chai_1.expect(sut.read()).to.equal(1);
        }
    });
    it("cycle 1", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.write(0)).to.be.true;
        chai_1.expect(sut.write(1)).to.be.true;
        chai_1.expect(sut.write(2)).to.be.true;
        chai_1.expect(sut.write(3)).to.be.false;
        chai_1.expect(sut.buffer).to.deep.equal([undefined, 0, 1, 2]);
    });
    it("cycle 2", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.write(0)).to.be.true;
        chai_1.expect(sut.write(1)).to.be.true;
        chai_1.expect(sut.write(2)).to.be.true;
        sut.read();
        chai_1.expect(sut.write(3)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, undefined, 1, 2]);
        chai_1.expect(sut.write(4)).to.be.false;
    });
    it("cycle 3", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.write(0)).to.be.true;
        chai_1.expect(sut.write(1)).to.be.true;
        chai_1.expect(sut.write(2)).to.be.true;
        sut.read();
        chai_1.expect(sut.write(3)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, undefined, 1, 2]);
        sut.read();
        chai_1.expect(sut.write(4)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, 4, undefined, 2]);
        chai_1.expect(sut.write(5)).to.be.false;
    });
    it("cycle 4", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.write(0)).to.be.true;
        chai_1.expect(sut.write(1)).to.be.true;
        chai_1.expect(sut.write(2)).to.be.true;
        sut.read();
        chai_1.expect(sut.write(3)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, undefined, 1, 2]);
        sut.read();
        chai_1.expect(sut.write(4)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, 4, undefined, 2]);
        sut.read();
        chai_1.expect(sut.write(5)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, 4, 5, undefined]);
        chai_1.expect(sut.write(6)).to.be.false;
    });
    it("cycle 5", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.write(0)).to.be.true;
        chai_1.expect(sut.write(1)).to.be.true;
        chai_1.expect(sut.write(2)).to.be.true;
        sut.read();
        chai_1.expect(sut.write(3)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, undefined, 1, 2]);
        sut.read();
        chai_1.expect(sut.write(4)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, 4, undefined, 2]);
        sut.read();
        chai_1.expect(sut.write(5)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([3, 4, 5, undefined]);
        sut.read();
        chai_1.expect(sut.write(6)).to.be.true;
        chai_1.expect(sut.buffer).to.deep.equal([undefined, 4, 5, 6]);
        chai_1.expect(sut.write(7)).to.be.false;
    });
    it("fills and empties", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        chai_1.expect(sut.write(0)).to.be.true;
        chai_1.expect(sut.write(1)).to.be.true;
        chai_1.expect(sut.write(2)).to.be.true;
        chai_1.expect(sut.read()).to.equal(0);
        chai_1.expect(sut.read()).to.equal(1);
        chai_1.expect(sut.read()).to.equal(2);
        chai_1.expect(sut.write(3)).to.be.true;
        chai_1.expect(sut.write(4)).to.be.true;
        chai_1.expect(sut.read()).to.equal(3);
        chai_1.expect(sut.read()).to.equal(4);
        chai_1.expect(sut.write(5)).to.be.true;
        chai_1.expect(sut.read()).to.equal(5);
        chai_1.expect(sut.write(6)).to.be.true;
        chai_1.expect(sut.read()).to.equal(6);
        chai_1.expect(sut.write(7)).to.be.true;
        chai_1.expect(sut.read()).to.equal(7);
        chai_1.expect(sut.write(8)).to.be.true;
        chai_1.expect(sut.read()).to.equal(8);
    });
    it("full cycles", () => {
        const sut = new CircularBuffer_1.CircularBuffer(4);
        sut.write("a");
        sut.write("b");
        sut.write("c");
        for (let i = 0; i < 1000; i++) {
            const a = sut.read();
            const b = sut.read();
            const c = sut.read();
            chai_1.expect(a).to.equal("a");
            chai_1.expect(b).to.equal("b");
            chai_1.expect(c).to.equal("c");
            sut.write(a);
            sut.write(b);
            sut.write(c);
            chai_1.expect(sut.write("nope")).to.be.false;
        }
    });
    it("partial cycles", () => {
        const sut = new CircularBuffer_1.CircularBuffer(8);
        sut.write("a");
        sut.write("b");
        sut.write("c");
        for (let i = 0; i < 10000; i++) {
            const a = sut.read();
            const b = sut.read();
            const c = sut.read();
            chai_1.expect(a).to.equal("a");
            chai_1.expect(b).to.equal("b");
            chai_1.expect(c).to.equal("c");
            sut.write(a);
            sut.write(b);
            sut.write(c);
        }
    });
});
//# sourceMappingURL=CircularBuffer.spec.js.map