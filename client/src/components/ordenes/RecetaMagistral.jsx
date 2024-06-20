import { Alert, Button, Modal, TextInput, Label } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import 'react-quill/dist/quill.snow.css';

export default function CommentRecetaMagistral({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();

  // Estados para cada input
  const [inputs, setInputs] = useState({
    nifedipino: '',
    lidocaina: '',
    baseCrema: '',
    aplicar: ''
  });

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  // Crear contenido para el post
  const createContent = () => {
    return `NIFEDIPINO ${inputs.nifedipino} % + LIDOCAINA AL ${inputs.lidocaina}% 
      EN BASE CREMA, ${inputs.baseCrema} gr.
      APLICAR 2 VECES AL DIA POR ${inputs.aplicar} SEMANAS.
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = createContent();
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          postId,
          userId: currentUser._id,
          name: 'Receta Magistral',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInputs({
          nifedipino: '',
          lidocaina: '',
          baseCrema: '',
          aplicar: ''
        });
        setCommentError(null);
        setComments([data, ...comments]);
        window.location.reload(); // Reload the page
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
        <form onSubmit={handleSubmit} className=''>
          <div>
              <h1 className='font-semibold pb-3'>Detalle: </h1>
          </div>
          <div className='border-2 p-2 mr-20 border-teal-500'>
            <div className='flex'>
                <div className='pr-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="nifedipino" value="NIFEDIPINO" />
                </div>
                <TextInput
                    type='text'
                    className='w-1/6'
                    color='success'
                    id="nifedipino" 
                    name="nifedipino"
                    sizing="sm"                
                    required
                    value={inputs.nifedipino}
                    onChange={handleChange}
                />
                <div className='pl-2 pr-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="lidocaina" value="% + LIDOCAINA AL" />
                </div>
                <TextInput
                    type='text'
                    id="lidocaina"
                    name="lidocaina"
                    className='w-1/6'
                    color='success'
                    sizing="sm"                
                    required
                    value={inputs.lidocaina}
                    onChange={handleChange}
                />
                <div className='pl-2 pr-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="percentage" value="%" />
                </div>
            </div>
            <div className='flex pt-1'>
                <div className='pr-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="baseCrema" value="EN BASE CREMA," />
                </div>
                <TextInput
                    type='text'
                    id="baseCrema"
                    name="baseCrema"
                    className='w-1/6'
                    color='success'
                    sizing="sm"                
                    required
                    value={inputs.baseCrema}
                    onChange={handleChange}
                />
                <div className='pl-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="grams" value="gr." />
                </div>
            </div>
            <div className='flex pt-4'>
                <div className='pr-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="aplicar" value="APLICAR 2 VECES AL DIA POR" />
                </div>
                <TextInput
                    type='text'
                    id="aplicar"
                    name="aplicar"
                    className='w-1/6'
                    color='success'
                    sizing="sm"                
                    required
                    value={inputs.aplicar}
                    onChange={handleChange}
                />
                <div className='pl-2 pt-1'>
                    <Label className='dark:text-black' htmlFor="weeks" value="SEMANAS." />
                </div>
            </div>
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
