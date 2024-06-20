import { Alert, Button, Modal } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { MultiSelect } from "react-multi-select-component";

export default function CommentExamenesLaboratorio({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [selected, setSelected] = useState([]);
  
  const options = [
    { label: "Hemograma", value: "Hemograma" },
    { label: "Creatinemia", value: "Creatinemia" },
    { label: "Electrolitos plasmaticos", value: "Electrolitos plasmaticos"},
    { label: "Pruebas de coagulacion", value: "Pruebas de coagulacion"},
    { label: "Perfil bioquimico", value: "Perfil bioquimico"},
    { label: "Perfil hepatico", value: "Perfil hepatico"},
    { label: "Perfil lipidico", value: "Perfil lipidico"},
    { label: "Anticuerpos anti endomisio", value: "Anticuerpos anti endomisio"},
    { label: "Anticuerpos anti transglutaminasa", value: "Anticuerpos anti transglutaminasa"},
    { label: "Procalcitonina", value: "Procalcitonina"},
    { label: "Directo de deposiciones", value: "Directo de deposiciones"},
    { label: "Coprocultivo", value: "Coprocultivo"},
    { label: "Crupo y rh", value: "Grupo y rh"},
    { label: "Parasitologico seriado", value: "Parasitologico seriado"},
    { label: "Panel ets", value: "Panel ets"},
  ];
  const navigate = useNavigate();

  const overrideStrings = {
    selectSomeItems: "Selecciona...",
    allItemsAreSelected: "Todos los examenes están seleccionados.",
    selectAll: "Seleccionar todo",
    search: "Buscar",
    selectAllFiltered: 'Seleccionar todo'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedValues = selected.map(option => option.value).join('\n'); // array a texto
    console.log(selectedValues);//funciona
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: selectedValues,
          name: 'Examenes Laboratorio',
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
        window.location.reload(); 
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = async (comment, editedContent) => {
    setComments(
      comments.map((c) =>
        c._id === comment._id ? { ...c, content: editedContent } : c
      )
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(comments.filter((comment) => comment._id !== commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChange = (value) => {
    setComment(value);
  };

  return (
    <div className='max-w-2xl mx-auto w-full'>
      {currentUser && (
        <form onSubmit={handleSubmit}>
          <label className='font-semibold'>Seleccionar Examenes</label>
          <div className='pt-3 pr-20 pb-5'>
            <MultiSelect
              className='text-sm'
              options={options}
              value={selected}
              onChange={setSelected}
              labelledBy="Select"
              overrideStrings={overrideStrings}
            />
          </div>
          <div className='flex place-content-end items-center mt-5'>
            <Button type='submit'>
              Guardar
            </Button>
          </div>
          {commentError && (
            <Alert color='failure' className='mt-5'>
              {commentError}
            </Alert>
          )}
        </form>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Estas eliminando esta receta completamente del registro, eliminar?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button
                color='failure'
                onClick={() => handleDelete(commentToDelete)}
              >
                Si, eliminar
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancelar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
