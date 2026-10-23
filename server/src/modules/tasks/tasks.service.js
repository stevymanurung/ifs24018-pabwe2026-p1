import { notFound } from '../../utils/httpError.js';

const FILTERS = {
  all: () => true,
  active: (task) => !task.done,
  done: (task) => task.done,
};

export function createTaskService({ taskRepository }) {
  return {
    list: (status = 'all', userId = 1) => taskRepository.findAll(userId).filter(FILTERS[status]),
    create: (input, userId = 1) => taskRepository.create(input, userId),

    setDone(id, done, userId = 1) {
      const task = taskRepository.setDone(id, done, userId);
      if (!task) throw notFound('Tugas tidak ditemukan');
      return task;
    },

    remove(id, userId = 1) {
      if (!taskRepository.remove(id, userId)) throw notFound('Tugas tidak ditemukan');
    },
  };
}
