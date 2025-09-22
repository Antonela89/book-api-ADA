import * as publishersModel from '../models/publishersModel.js';

function getPublishers() {
  return publishersModel.getPublishers();
}

function addPublisher(publisher) {
  publishersModel.addPublisher(publisher);
}

export {
  getPublishers,
  addPublisher
};