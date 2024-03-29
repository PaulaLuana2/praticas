import React, {useState, useCallback, useEffect} from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa';
import {Container, Form, SubmitButton, List, DeleteButton} from './styles';

import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function Main(){

  const [newRepo, setNewRepo] = useState('');
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Buscar
  useEffect(()=>{
    const repoStorage = localStorage.getItem('@repos');

    setRepositorios(JSON.parse(repoStorage) || []);

  }, []);


  const handleSubmit = useCallback((e)=>{
    e.preventDefault();

    async function submit(){
      setLoading(true);
      setAlert(null);
      try{

        if(newRepo === ''){
          setErrorMessage('Você precisa indicar um repositorio!');
          throw new Error('Você precisa indicar um repositorio!');
        }

        const response = await api.get(`repos/${newRepo}`);

        const hasRepo = repositorios.find(repo => repo.name === newRepo);

        if(hasRepo){
          setErrorMessage('Repositorio duplicado');
          throw new Error('Repositorio duplicado');
        }
  
        const data = {
          name: response.data.full_name,
        }
    
        repositorios.push(data);
        localStorage.setItem("@repos", JSON.stringify(repositorios));
        setNewRepo('');
      }catch(error){
        if(error.code === 'ERR_BAD_REQUEST') setErrorMessage("Repositório não encontrado");

        setAlert(true);
        console.log(error);
      }finally{
        setLoading(false);
      }

    }

    submit();

  }, [newRepo, repositorios]);

  function handleinputChange(e){
    setNewRepo(e.target.value);
    setAlert(null);
    setErrorMessage('');
  }

  const handleDelete = useCallback((repo)=> {
    const find = repositorios.filter(r => r.name !== repo);
    setRepositorios(find);
  }, [repositorios]);


  return(
    <Container>
      
      <h1>
        <FaGithub size={25}/>
        Meus Repositorios
      </h1>

      <Form onSubmit={handleSubmit} error={alert}>
        <input 
        type="text" 
        placeholder="Adicionar Repositorios"
        value={newRepo}
        onChange={handleinputChange}
        />

        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color="#FFF" size={14}/>
          ) : (
            <FaPlus color="#FFF" size={14}/>
          )}
        </SubmitButton>

      </Form>

      <p style={{color: 'red'}}>{errorMessage}</p>

      <List>
         {repositorios.map(repo => (
           <li key={repo.name}>
             <span>
             <DeleteButton onClick={()=> handleDelete(repo.name) }>
                <FaTrash size={14}/>
             </DeleteButton>  
             {repo.name}
             </span>
             <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
               <FaBars size={20}/>
             </Link>
           </li>
         ))} 
      </List>

    </Container>
  )
}