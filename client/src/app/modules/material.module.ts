import { NgModule } from '@angular/core';

// Form Controls
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

// Date
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// Navigation
import { MatToolbarModule } from '@angular/material/toolbar';

// Layout
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

// Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Popups & Modals
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Data Table
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [],
  imports: [
    // Form Controls
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSelectModule,
    // Date
    MatDatepickerModule,
    // Navigation
    MatToolbarModule,
    // Layout
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatTabsModule,
    // Buttons & Indicators
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    // Popups & Modals
    MatSnackBarModule,
    MatTooltipModule,
    // Data Table
    MatTableModule
  ],
  exports: [
    // Form Controls
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSelectModule,
    // Date
    MatDatepickerModule,
    // Navigation
    MatToolbarModule,
    // Layout
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatTabsModule,
    // Buttons & Indicators
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    // Popups & Modals
    MatSnackBarModule,
    MatTooltipModule,
    // Data Table
    MatTableModule
  ],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000,
        panelClass: 'snack-bar',
        horizontalPosition: 'center'
      }
    },
    { provide: MAT_DATE_LOCALE, useValue: 'sr' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ]
})
export class MaterialModule { }
