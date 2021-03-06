const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {action, model, error} = require('..');


describe('action', () => {

  it('should always be asynchronous', async () => {
    const greet = action.createAction(name => `Hello ${name}`);
    const res = await greet('Paul');

    expect(res).to.equal('Hello Paul');
  });

  it('should wait for async handler', async () => {
    const asyncAdd = async (a, b) => a + b;
    const add = action.createAction(async (a, b) => await asyncAdd(a, b));
    const res = await add(20, 22);

    expect(res).to.equal(42);
  });

  it('should commit change to models', async () => {
    const Book = model.createModel();
    const createBook = action.createAction(() => Book.objects.create(), [Book]);

    await createBook();

    expect(Book.objects.length).to.equal(1);
  });

})
