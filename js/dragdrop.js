/**
 * Drag & Drop Module
 */
const DragDrop = (() => {
  let draggedElement = null;
  let draggedType = null;

  function init(container) {
    if (!container) return;

    container.querySelectorAll('[draggable="true"]').forEach(el => {
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
    });

    const dropZones = container.querySelectorAll('.drop-zone, #questions-container, .question-block');
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', handleDragOver);
      zone.addEventListener('dragleave', handleDragLeave);
      zone.addEventListener('drop', handleDrop);
    });
  }

  function handleDragStart(e) {
    draggedElement = e.target.closest('[draggable="true"]');
    draggedType = draggedElement?.dataset?.questionType || null;
    if (draggedElement) {
      draggedElement.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', draggedType || 'reorder');
      if (draggedElement.classList.contains('question-block')) {
        e.dataTransfer.setData('question-id', draggedElement.dataset.questionId);
      }
    }
  }

  function handleDragEnd(e) {
    if (draggedElement) draggedElement.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    draggedElement = null;
    draggedType = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const target = e.target.closest('.drop-zone, #questions-container, .question-block');
    if (target) target.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    const target = e.target.closest('.drop-zone, #questions-container, .question-block');
    if (target && !target.contains(e.relatedTarget)) {
      target.classList.remove('drag-over');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const container = document.getElementById('questions-container');
    const dropZone = e.target.closest('.drop-zone, #questions-container');
    if (dropZone) dropZone.classList.remove('drag-over');

    const questionId = e.dataTransfer.getData('question-id');
    if (questionId && window.SurveyBuilder) {
      const targetBlock = e.target.closest('.question-block');
      SurveyBuilder.reorderQuestion(questionId, targetBlock?.dataset?.questionId);
      return;
    }

    const type = e.dataTransfer.getData('text/plain');
    if (type && type !== 'reorder' && window.SurveyBuilder) {
      SurveyBuilder.addQuestion(type);
    }
  }

  function enableQuestionReorder(block) {
    block.setAttribute('draggable', 'true');
    block.addEventListener('dragstart', handleDragStart);
    block.addEventListener('dragend', handleDragEnd);
  }

  return { init, enableQuestionReorder, handleDragOver, handleDragLeave, handleDrop };
})();

window.DragDrop = DragDrop;
