import { Alert, Button, Modal, TextInput, Label, Textarea} from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { MultiSelect } from "react-multi-select-component";

export default function CommentSolicitudImagenes({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [observaciones, setObservaciones] = useState(''); // Estado para el input adicional
  const [selected, setSelected] = useState([]);
  const [ecografia, setEcografia] = useState(''); // Estado para el input adicional
  const navigate = useNavigate();

  const options = [
    { label: "Resonancia de pelvis", value: "Resonancia de pelvis" },
    { label: "Resonancia de pelvis protocolo recto", value: "Resonancia de pelvis protocolo recto" },
    { label: "Electrolitos plasmáticos", value: "Electrolitos plasmáticos"},
    { label: "Rm de abdomen con gabadolinio", value: "Rm de abdomen con gabadolinio"},
    { label: "Defecorresonancia", value: "Defecorresonancia"},
    { label: "Tac abdomen y pelvis con contraste", value: "Tac abdomen y pelvis con contraste"},
    { label: "Tac de torax y con contraste", value: "Tac de torax y con contraste"},
    { label: "Tac de orbita y maxilofacial sin contraste", value: "Tac de orbita y maxilofacial sin contraste"},
  ];

  const overrideStrings = {
    selectSomeItems: "Selecciona...",
    allItemsAreSelected: "Todos los examenes están seleccionados.",
    selectAll: "Seleccionar todo",
    search: "Buscar",
    selectAllFiltered: 'Seleccionar todo'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedValues = selected.map(option => '- ' + option.value).join('\n');
    let content = selectedValues;
    
    // Verifica si el input adicional tiene algún valor
    if (ecografia.trim()) {
      content += `\n- Ecografia de partes blandas: ${ecografia}`;
    }
    if (observaciones.trim()) {
      content += `\n\nObservaciones: \n- ${observaciones}`;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          name: 'Solicitud de imagenes',
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected([]); // Limpia la selección
        setEcografia(''); // Limpia el input adicional
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

  return (
    <div className='max-w-2xl mx-auto w-full'>
      {currentUser && (
        <form onSubmit={handleSubmit}>
          <label className='font-semibold'>Seleccionar Examenes</label>
          <div className='border-2 p-4 border-teal-500 mr-2 mt-2'>
            <div className='pb-5'>
              <MultiSelect
                className='text-sm'
                options={options}
                value={selected}
                onChange={setSelected}
                labelledBy="Select"
                overrideStrings={overrideStrings}
              />
            </div>
            <div className='flex'>
              <div className='pr-2'>
                <Label className='dark:text-black' htmlFor="ecografia" value="Ecografía de partes blandas" />
              </div>
              <TextInput
                  placeholder='En caso de solicitud de ecografia...'
                  type='text'
                  className='w-3/6'
                  id="ecografia" 
                  name="ecografia"
                  sizing="sm"
                  color='success'
                  value={ecografia} // Vincular con el estado
                  onChange={(e) => setEcografia(e.target.value)} // Manejar cambios
              />
            </div>
            <div className='pt-3'>
                  <h1 className='font-semibold pb-3'>Observaciones: (opcional)</h1>
                </div>
                <Textarea
                  placeholder='Escribir observaciones...'
                  type='text'
                  className=''
                  id="observaciones" 
                  name="observaciones"
                  color='success'
                  value={observaciones} // Vincular con el estado
                  onChange={(e) => setObservaciones(e.target.value)} // Manejar cambios
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
