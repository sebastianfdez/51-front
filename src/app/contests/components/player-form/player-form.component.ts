import { Component, forwardRef, AfterContentInit, Input, Injector } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup } from '@angular/forms';
import { ComponentUtils } from 'src/app/shared/services/component-utils';
import { Participant } from '../../models/categorie';

@Component({
    selector: 'app-player-form',
    templateUrl: './player-form.component.html',
    styleUrls: ['./player-form.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR, 
        useExisting: forwardRef(() => PlayerFormComponent),
        multi: true     
    }],
})
export class PlayerFormComponent implements ControlValueAccessor, AfterContentInit {
    @Input() playerForm: FormGroup;
    @Input() isSpeaker: Boolean = false;
    @Input() isJudge: Boolean = false;
    participant_: Participant = null;
    @Input() votesRecord: { [codeParticipant: string]: number } = {};

    constructor(
        private componentUtils: ComponentUtils,
        private injector: Injector,
    ) {}

    ngAfterContentInit() {
        if (!this.playerForm) {
            this.playerForm = this.componentUtils.getFormGroup(this.injector);
            this.participant_ = this.playerForm.value;
        }
    }

    propagateChange = (_: any) => {};

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() {}

    writeValue(value: string): void {}

    setDisabledState?(isDisabled: boolean): void {}

    get disabled(): boolean {
        return this.playerForm.disabled;
    }

    valueChange(event: Event, id: string) {
        const value: number = (event.target as HTMLInputElement).value as any as number;
        if (value > 100) {
            this.votesRecord[id] = 100;
        } else if (value < 0) {
            this.votesRecord[id] = 0;
        } else if ((value * 100) % 1 !== 0) {
            this.votesRecord[id] = Math.floor(value * 100) / 100 ? Math.floor(value * 100) / 100 : 0;
        }
    }
}