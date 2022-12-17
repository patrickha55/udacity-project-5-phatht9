import React, { useEffect, useState } from "react";
import { Form, Button, Icon } from 'semantic-ui-react';
import Auth from '../auth/Auth';
import { getUploadUrl, patchTodoAttachment, uploadFile, deleteTodoAttachment } from '../api/todos-api';

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string;
      hasAttachment: string;
    };
  };
  auth: Auth;
}

export const EditTodo = ({ match, auth }: EditTodoProps) => {
  const [file, setFile] = useState(undefined);
  const [uploadState, setUploadState] = useState(UploadState.NoUpload);
  const [hasAttachmentStatus, setHasAttachmentStatus] = useState(false);

  useEffect(() => {
    if (match.params.hasAttachment === 'yes') {
      setHasAttachmentStatus(true);
    }
    else {
      setHasAttachmentStatus(false);
    }
  }, [match.params.hasAttachment]);

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

      setHasAttachmentStatus(true);

      alert(`File was uploaded! ${hasAttachmentStatus}`);
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message);
    } finally {
      setUploadState(UploadState.NoUpload);
    }
  };

  const handleTodoAttachmentDelete = async () => {
    try {
      const result: boolean = await deleteTodoAttachment(
        auth.getIdToken(),
        match.params.todoId
      );

      if (result) {
        alert('Attachment deleted successfully!');
      }

      setHasAttachmentStatus(false);
    } catch (e) {
      alert('Could not delete this todo item\'s attachment: ' + (e as Error).message);
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
  return (<>
    <h1>Upload new image</h1>

    <div className="row">
      <div className="col-6">
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input type="file" accept="image/*" placeholder="Image to upload" onChange={handleFileChange} />
          </Form.Field>

          {renderButton()}
        </Form>
      </div>
      <div className="col-6">
        <Button
          icon
          color="red"
          onClick={() => handleTodoAttachmentDelete()}
          data-toggle="tooltip" data-placement="right" title="Delete this todo item's attachment."
          disabled={hasAttachmentStatus}
        >
          <Icon name="delete" />
        </Button>
      </div>
    </div>
  </>);
};
