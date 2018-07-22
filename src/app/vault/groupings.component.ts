import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { FolderAddEditComponent } from './folder-add-edit.component';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';
import { ModalComponent } from 'jslib/angular/components/modal.component';
import { CipherType } from 'jslib/enums';
import { FolderView } from 'jslib/models/view/folderView';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent implements OnInit {
    @ViewChild('folderAddEdit', { read: ViewContainerRef }) folderAddEditModalRef: ViewContainerRef;

    types = [
        {
            name: 'typeLogin',
            key: CipherType.Login,
            icon: 'fa-globe',
        },
        {
            name: 'typeCard',
            key: CipherType.Card,
            icon: 'fa-credit-card',
        },
        {
            name: 'typeIdentity',
            key: CipherType.Identity,
            icon: 'fa-id-card-o',
        },
        {
            name: 'typeSecureNote',
            key: CipherType.SecureNote,
            icon: 'fa-sticky-note-o',
        },
    ];

    private modal: ModalComponent = null;

    constructor(collectionService: CollectionService, folderService: FolderService,
        private componentFactoryResolver: ComponentFactoryResolver) {
        super(collectionService, folderService);
    }

    ngOnInit(): void {
        this.load();
    }

    async editFolder(f: FolderView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.folderAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<FolderAddEditComponent>(
            FolderAddEditComponent, this.folderAddEditModalRef);

        childComponent.folderId = f.id;
        childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
            this.modal.close();
            await this.loadFolders();
        });
        childComponent.onDeletedFolder.subscribe(async (folder: FolderView) => {
            this.modal.close();
            await this.loadFolders();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async addFolder() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.folderAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<FolderAddEditComponent>(
            FolderAddEditComponent, this.folderAddEditModalRef);

        childComponent.folderId = null;
        childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
            this.modal.close();
            await this.loadFolders();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }
}
