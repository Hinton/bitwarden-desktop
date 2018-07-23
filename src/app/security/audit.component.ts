import { Component, OnInit } from '@angular/core';
import { AuditService, CipherService } from 'jslib/abstractions';
import { CipherType } from 'jslib/enums';
import { BreachAccountResponse } from 'jslib/models/response/breachAccountResponse';
import { CipherView } from 'jslib/models/view';

class AuditItem {
    constructor(public cipher: CipherView, public leaked: boolean, public weak: boolean, public reuse: boolean) {}
}

class BreachedItem {
    constructor(public username: string, public breaches: BreachAccountResponse[]) {}
}

@Component({
    selector: 'app-audit',
    templateUrl: 'audit.component.html',
})
export class AuditComponent implements OnInit {
    allCiphers: CipherView[];
    auditItems: AuditItem[] = [];
    breachedAccounts: BreachedItem[] = [];

    constructor(private cipherService: CipherService, private auditService: AuditService) {}

    ngOnInit(): void {
        this.load();
    }

    async load() {
        this.allCiphers = await this.cipherService.getAllDecrypted();

        const loginCiphers = this.allCiphers.filter(
            (cipher) => cipher.type === CipherType.Login && cipher.login.password != null,
        );

        const passwords = new Map<string, number>();
        for (const cipher of loginCiphers) {
            passwords.set(cipher.login.password, passwords.get(cipher.login.password) + 1);
        }

        const usernames = new Set<string>();
        loginCiphers.forEach((cipher) => usernames.add(cipher.login.username));

        this.breachedAccounts = await Promise.all(
            Array.from(usernames).map(async (username) =>
                new BreachedItem(username, await this.auditService.breachedAccounts(username))),
        );

        for (const cipher of loginCiphers) {
            const leaked = await this.auditService.passwordLeaked(cipher.login.password) > 1;
            const weak = await this.auditService.weakPassword(cipher.login.password);
            const reuse = passwords.get(cipher.login.password) > 1;

            if (leaked || weak) {
                this.auditItems.push(new AuditItem(cipher, leaked, weak, reuse));
            }
        }
    }

    countLeaked(): number {
        return this.auditItems.filter((cipher) => cipher.leaked).length;
    }

    countWeak(): number {
        return this.auditItems.filter((cipher) => cipher.weak).length;
    }

    countReused(): number {
        return this.auditItems.filter((cipher) => cipher.reuse).length;
    }
}
