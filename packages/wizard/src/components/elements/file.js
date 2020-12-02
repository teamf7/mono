import React, { useContext } from 'react';
import { WizardContext } from '../wizard';
import { mdiWindowClose } from '@mdi/js';
import Icon from '@mdi/react';


const fileTypes = {
  doc: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  img: ['image/gif', 'image/png', 'image/jpeg'],
};

export default function File({ data, value, onChange, name }) {
  const uploadFile = (e) => {
    let requests = [];
    for (const file of e.target.files) {
      if (file.size > data.maxSize) {
        alert(`Файл ${file.name} превышает допустимый размер`);
        return;
      }
      if (
        data.fileType !== 'all' &&
        fileTypes[data.fileType].indexOf(file.type) === -1
      ) {
        alert(`Некорректный формат файла ${file.name}`);
        return;
      }
      const form = new FormData();
      form.append('file', file);
      requests.push(
        fetch(
            data.url,
          process.env.NODE_ENV === 'development'
            ? {}
            : {
              method: 'POST',
              body: form,
            },
        ),
      );
    }
    const fileList = e.target.files;
    Promise.all(requests).
      then((res) => Promise.all(res.map((res) => res.json()))).
      then((res) => {
        const value = res.map(({ id, url }, index) => {
          return {
            id,
            url,
            name: fileList[index].name,
            type: fileList[index].type,
            size: fileList[index].size,
          };
        });
        onChange({
          target: {
            name,
            value,
          },
        });
      });
  };
  const deleteFile = (index) => {
    const newValue = value.slice();
    newValue.splice(index, 1);
    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };
  return (
    <>
      Тип: {data.fileType} Макс. размер: {Math.round(data.maxSize / 1000)}КБ
      <div className="file-wrapper">
        <label htmlFor={name} className="file-button">
          Добавить файл
          </label>
        <input
          id={name}
          name={name}
          onChange={uploadFile}
          type="file"
          style={{ color: 'black' }}
          multiple="multiple"
          className="wizard-element-input-file"
        />
        {value.length
          ? value.map((f, index) => (
            <div className="file-info" key={'file-prop-' + f.id}>
              <a className="file-info-link" href={f.url}>
                {f.name}
              </a>
              {Math.round(f.size / 1000)}КБ
              <Icon
                title="Удалить файл"
                className="icon-close icon-close-list"
                path={mdiWindowClose}
                onClick={() => deleteFile(index)}
              />
            </div>
          ))
          : ''}
      </div>
    </>
  );
}
