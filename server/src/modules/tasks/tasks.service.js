import { notFound } from '../../utils/httpError.js';

const FILTERS = {
  all: () => true,
  active: (task) => !task.done,
  done: (task) => task.done,
};

export function createTaskService({ taskRepository }) {
  return {
    list: (status = 'all') => taskRepository.findAll().filter(FILTERS[status]),
    create: (input) => taskRepository.create(input),

    setDone(id, done) {
      const task = taskRepository.setDone(id, done);
      if (!task) throw notFound('Tugas tidak ditemukan');
      return task;
    },

    remove(id) {
      if (!taskRepository.remove(id)) throw notFound('Tugas tidak ditemukan');
    },
  };
}
