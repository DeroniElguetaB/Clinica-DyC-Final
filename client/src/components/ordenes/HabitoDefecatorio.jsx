import { Alert, Button, Modal } from 'flowbite-react';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function CommentHabitoDefecatorio({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();
  const h1Ref = useRef();
  const pRefs = useRef([]);
  
  // const stripHtml = (html) => {
  //   const doc = new DOMParser().parseFromString(html, 'text/html');
  //   return doc.body.textContent || "";
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 1000) {
      return;
    }
    // const strippedComment = stripHtml(comment);
    const h1Content = h1Ref.current.innerText;
    const pContents = pRefs.current.map(p => p.innerText).join('\n');
    const combinedContent = `${h1Content}\n${pContents}`;
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: combinedContent,
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
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

  const handleChange = (value) => {
    setComment(value);
  };

    return (
        <div className='max-w-2xl mx-auto w-full'>
            {currentUser && (
              <form onSubmit={handleSubmit} className=''>
                <div className=''>
                  <div>
                    <h1 className='font-semibold pb-3' ref={h1Ref}>Indicaciones: </h1>
                  </div>
                  <div>
                    <p ref={el => pRefs.current[0] = el}>DIETA RICA EN FIBRA, 30 GR DÍA </p>
                  </div>
                  <div>
                    <p ref={el => pRefs.current[1] = el}>LIQUIDOS 2 – 2.5 LITROS DIA </p>
                  </div>
                  <div>
                    <p ref={el => pRefs.current[2] = el}>SUPLEMENTO DE FIBRA BARRA O POLVO  </p>
                  </div>
                  <div>
                    <p ref={el => pRefs.current[3] = el}>CONTUMAX 1 SOBRE DISUELTO EN 250 CC DE AGUA 1 VEZ EN LA MAÑANA </p>
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
                        Estas eliminando este archivo completamente del registro, eliminar?
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
