
UploadAdapter = class UploadAdapter
{
	constructor(loader, path) {
        this.loader = loader;
		this.path = path;
    }

    upload() {
        return new Promise((resolve, reject) => {
            return this.loader.file
            .then(file => {
                const form = new FormData();
                form.append('upload', file);

                return fetch(this.path, {
                    method: 'POST',
                    // headers: {},
                    body: form,
                })
                .then(res => {
                    if ( !res.ok  ) throw new Error(`정상적으로 응답을 받지 못함.`);
                    return res.json();
                })
                .then(({body: filename}) => {
                    resolve({
                        default: this.path + '/' + filename,
                    });
                })
                .catch(reject);
            });
        });
    }
}

