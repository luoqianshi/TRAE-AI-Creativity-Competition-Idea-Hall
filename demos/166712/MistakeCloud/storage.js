class StorageManager {
    constructor() {
        this.dbName = 'MistakeCloudDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('errorBookCollections')) {
                    const collectionStore = db.createObjectStore('errorBookCollections', { keyPath: 'id', autoIncrement: true });
                    collectionStore.createIndex('name', 'name', { unique: false });
                    collectionStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('errorBooks')) {
                    const bookStore = db.createObjectStore('errorBooks', { keyPath: 'id', autoIncrement: true });
                    bookStore.createIndex('collectionId', 'collectionId', { unique: false });
                    bookStore.createIndex('name', 'name', { unique: false });
                    bookStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('errorItems')) {
                    const itemStore = db.createObjectStore('errorItems', { keyPath: 'id', autoIncrement: true });
                    itemStore.createIndex('bookId', 'bookId', { unique: false });
                    itemStore.createIndex('createdAt', 'createdAt', { unique: false });
                    itemStore.createIndex('errorReason', 'errorReason', { unique: false });
                }
            };
        });
    }

    async addCollection(collectionData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBookCollections'], 'readwrite');
            const store = transaction.objectStore('errorBookCollections');
            const collection = {
                name: collectionData.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const request = store.add(collection);

            request.onsuccess = () => {
                resolve({ ...collection, id: request.result });
            };

            request.onerror = () => {
                reject(new Error('Failed to add collection'));
            };
        });
    }

    async getCollections() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBookCollections'], 'readonly');
            const store = transaction.objectStore('errorBookCollections');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get collections'));
            };
        });
    }

    async updateCollection(id, collectionData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBookCollections'], 'readwrite');
            const store = transaction.objectStore('errorBookCollections');

            store.get(id).onsuccess = (event) => {
                const collection = event.target.result;
                collection.name = collectionData.name || collection.name;
                collection.updatedAt = new Date().toISOString();

                const request = store.put(collection);

                request.onsuccess = () => {
                    resolve(collection);
                };

                request.onerror = () => {
                    reject(new Error('Failed to update collection'));
                };
            };
        });
    }

    async deleteCollection(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBookCollections', 'errorBooks', 'errorItems'], 'readwrite');
            const collectionStore = transaction.objectStore('errorBookCollections');
            const bookStore = transaction.objectStore('errorBooks');
            const itemStore = transaction.objectStore('errorItems');

            bookStore.index('collectionId').getAll(id).onsuccess = (event) => {
                const books = event.target.result;
                books.forEach(book => {
                    itemStore.index('bookId').getAll(book.id).onsuccess = (event) => {
                        const items = event.target.result;
                        items.forEach(item => {
                            itemStore.delete(item.id);
                        });
                    };
                    bookStore.delete(book.id);
                });
            };

            const request = collectionStore.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to delete collection'));
            };
        });
    }

    async addBook(bookData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBooks'], 'readwrite');
            const store = transaction.objectStore('errorBooks');
            const book = {
                collectionId: bookData.collectionId || null,
                name: bookData.name,
                description: bookData.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const request = store.add(book);

            request.onsuccess = () => {
                resolve({ ...book, id: request.result });
            };

            request.onerror = () => {
                reject(new Error('Failed to add book'));
            };
        });
    }

    async getBooks(collectionId = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBooks'], 'readonly');
            const store = transaction.objectStore('errorBooks');

            if (collectionId) {
                const index = store.index('collectionId');
                const request = index.getAll(collectionId);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(new Error('Failed to get books'));
                };
            } else {
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(new Error('Failed to get books'));
                };
            }
        });
    }

    async getBook(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBooks'], 'readonly');
            const store = transaction.objectStore('errorBooks');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get book'));
            };
        });
    }

    async updateBook(id, bookData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBooks'], 'readwrite');
            const store = transaction.objectStore('errorBooks');

            store.get(id).onsuccess = (event) => {
                const book = event.target.result;
                book.name = bookData.name || book.name;
                book.description = bookData.description !== undefined ? bookData.description : book.description;
                book.updatedAt = new Date().toISOString();

                const request = store.put(book);

                request.onsuccess = () => {
                    resolve(book);
                };

                request.onerror = () => {
                    reject(new Error('Failed to update book'));
                };
            };
        });
    }

    async deleteBook(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorBooks', 'errorItems'], 'readwrite');
            const bookStore = transaction.objectStore('errorBooks');
            const itemStore = transaction.objectStore('errorItems');

            let itemsDeleted = false;
            let bookDeleted = false;

            const checkComplete = () => {
                if (itemsDeleted && bookDeleted) {
                    resolve();
                }
            };

            itemStore.index('bookId').getAll(id).onsuccess = (event) => {
                const items = event.target.result || [];
                
                if (items.length === 0) {
                    itemsDeleted = true;
                    checkComplete();
                    return;
                }

                let deletedCount = 0;
                items.forEach(item => {
                    const deleteReq = itemStore.delete(item.id);
                    deleteReq.onsuccess = () => {
                        deletedCount++;
                        if (deletedCount === items.length) {
                            itemsDeleted = true;
                            checkComplete();
                        }
                    };
                    deleteReq.onerror = () => {
                        reject(new Error('Failed to delete item'));
                    };
                });
            };

            itemStore.index('bookId').getAll(id).onerror = () => {
                itemsDeleted = true;
                checkComplete();
            };

            const request = bookStore.delete(id);

            request.onsuccess = () => {
                bookDeleted = true;
                checkComplete();
            };

            request.onerror = () => {
                reject(new Error('Failed to delete book'));
            };

            transaction.oncomplete = () => {
                if (!bookDeleted) {
                    bookDeleted = true;
                }
                if (!itemsDeleted) {
                    itemsDeleted = true;
                }
                checkComplete();
            };

            transaction.onerror = (event) => {
                event.preventDefault();
                reject(new Error('Transaction failed: ' + (transaction.error?.message || 'Unknown error')));
            };
        });
    }

    async addItem(itemData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readwrite');
            const store = transaction.objectStore('errorItems');
            const item = {
                bookId: itemData.bookId,
                questionText: itemData.questionText || '',
                errorReason: itemData.errorReason || [],
                answer: itemData.answer || '',
                annotations: itemData.annotations || '',
                images: itemData.images || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const request = store.add(item);

            request.onsuccess = () => {
                resolve({ ...item, id: request.result });
            };

            request.onerror = () => {
                reject(new Error('Failed to add item'));
            };
        });
    }

    async getItems(bookId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readonly');
            const store = transaction.objectStore('errorItems');
            const index = store.index('bookId');
            const request = index.getAll(bookId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get items'));
            };
        });
    }

    async getItem(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readonly');
            const store = transaction.objectStore('errorItems');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get item'));
            };
        });
    }

    async updateItem(id, itemData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readwrite');
            const store = transaction.objectStore('errorItems');

            store.get(id).onsuccess = (event) => {
                const item = event.target.result;
                item.questionText = itemData.questionText !== undefined ? itemData.questionText : item.questionText;
                item.errorReason = itemData.errorReason !== undefined ? itemData.errorReason : item.errorReason;
                item.answer = itemData.answer !== undefined ? itemData.answer : item.answer;
                item.annotations = itemData.annotations !== undefined ? itemData.annotations : item.annotations;
                item.images = itemData.images !== undefined ? itemData.images : item.images;
                item.drawingData = itemData.drawingData !== undefined ? itemData.drawingData : item.drawingData;
                item.updatedAt = new Date().toISOString();

                const request = store.put(item);

                request.onsuccess = () => {
                    resolve(item);
                };

                request.onerror = () => {
                    reject(new Error('Failed to update item'));
                };
            };
        });
    }

    async deleteItem(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readwrite');
            const store = transaction.objectStore('errorItems');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to delete item'));
            };
        });
    }

    async searchItems(query) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readonly');
            const store = transaction.objectStore('errorItems');
            const request = store.getAll();

            request.onsuccess = () => {
                const items = request.result;
                const lowerQuery = query.toLowerCase();

                const filteredItems = items.filter(item => {
                    const textMatch = item.questionText.toLowerCase().includes(lowerQuery);
                    const annotationMatch = item.annotations.toLowerCase().includes(lowerQuery);
                    const reasonMatch = item.errorReason.some(reason =>
                        reason.toLowerCase().includes(lowerQuery)
                    );

                    return textMatch || annotationMatch || reasonMatch;
                });

                resolve(filteredItems);
            };

            request.onerror = () => {
                reject(new Error('Failed to search items'));
            };
        });
    }

    async getStatistics() {
        const collections = await this.getCollections();
        const books = await this.getBooks();
        const items = await new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['errorItems'], 'readonly');
            const store = transaction.objectStore('errorItems');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to get items'));
        });

        return {
            totalCollections: collections.length,
            totalBooks: books.length,
            totalItems: items.length,
            errorReasons: this._getErrorReasonStats(items)
        };
    }

    _getErrorReasonStats(items) {
        const reasonCounts = {};
        items.forEach(item => {
            item.errorReason.forEach(reason => {
                reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
            });
        });
        return reasonCounts;
    }
}

const storage = new StorageManager();