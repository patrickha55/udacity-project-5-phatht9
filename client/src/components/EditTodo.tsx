import React, { useState } from "react";
import { Form, Button } from 'semantic-ui-react';
import Auth from '../auth/Auth';
import { getUploadUrl, patchTodoAttachment, uploadFile } from '../api/todos-api';
enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}
interface EditTodoProps {
  match: {
    params: {
      todoId: string;
    };
  };
  auth: Auth;
}
export const EditTodo = ({ match, auth }: EditTodoProps) => {
  const [file, setFile] = useState(undefined);
  const [uploadState, setUploadState] = useState(UploadState.NoUpload);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files)
      return;

    // @ts-ignore
    setFile(files[0]);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      if (!file) {
        alert('File should be selected');
        return;
      }

      setUploadState(UploadState.FetchingPresignedUrl);
      const uploadUrl = await getUploadUrl(
        auth.getIdToken(),
        match.params.todoId);

      setUploadState(UploadState.UploadingFile);

      await uploadFile(uploadUrl, file);

      await patchTodoAttachment(
        auth.getIdToken(),
        match.params.todoId,
        match.params.todoId
      );

      alert('File was uploaded!');
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message);
    } finally {
      setUploadState(UploadState.NoUpload);
    }
  };

  const renderButton = () => {
    return (<div>
      {uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
      {uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
      <Button loading={uploadState !== UploadState.NoUpload} type="submit">
        Upload
      </Button>
    </div>);
  };
  return (<div>
    <h1>Upload new image</h1>

    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>File</label>
        <input type="file" accept="image/*" placeholder="Image to upload" onChange={handleFileChange} />
      </Form.Field>

      {renderButton()}
    </Form>
  </div>);
};
