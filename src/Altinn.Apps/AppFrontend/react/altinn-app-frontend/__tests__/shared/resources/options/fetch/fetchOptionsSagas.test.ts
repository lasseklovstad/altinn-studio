import { expectSaga, testSaga } from 'redux-saga-test-plan';
import { select } from 'redux-saga/effects';
import FormDataActions from 'src/features/form/data/formDataActions';
import { checkIfOptionsShouldRefetchSaga, fetchSpecificOptionSaga, formDataSelector, optionsSelector, userLanguageSelector, watchCheckIfOptionsShouldRefetchSaga } from 'src/shared/resources/options/fetch/fetchOptionsSagas';
import { IOptions } from 'src/types';
import * as networking from 'altinn-shared/utils/networking';


describe('shared > resources > options > fetch > fetchOptionsSagas', () => {
    describe('watchCheckIfOptionsShouldRefetchSaga', () => {
        it('should take every updateFormData action and spawn checkIfOptionsShouldRefetchSaga', () => {
            testSaga(watchCheckIfOptionsShouldRefetchSaga)
                .next()
                .takeEvery(FormDataActions.updateFormData, checkIfOptionsShouldRefetchSaga)
                .next()
                .isDone();
        });
    });

    describe('checkIfOptionsShouldRefetchSaga', () => {
        const userLanguage = 'nb';
        const action = {
            payload: {
                field: 'some_field',
                data: ''
            }, type: ''
        };
        const formData = {
            someField: 'someValue'
        };


        it('should refetch a given option when an updated field is in a option mapping', () => {
            jest.spyOn(networking, 'get').mockResolvedValue([]);
            const optionsWithField: IOptions = {
                someOption: {
                    options: [],
                    mapping: {
                        some_field: 'some_url_parm'
                    }
                }
            };
            return expectSaga(checkIfOptionsShouldRefetchSaga, action)
                .provide([
                    [select(formDataSelector), formData],
                    [select(userLanguageSelector), userLanguage],
                    [select(optionsSelector), optionsWithField],
                ])
                .fork(fetchSpecificOptionSaga, {
                    optionsId: 'someOption',
                    formData,
                    dataMapping: {
                        some_field: 'some_url_parm'
                    },
                    language: userLanguage
                })
                .run();
        });

        it('should do nothing when an updated field is not present in a option mapping', () => {
            const optionsWithouthField: IOptions = {
                someOption: {
                    options: [],
                    mapping: {
                        some_other_field: 'some_url_parm'
                    }
                }
            };
            return expectSaga(checkIfOptionsShouldRefetchSaga, action)
                .provide([
                    [select(formDataSelector), formData],
                    [select(userLanguageSelector), userLanguage],
                    [select(optionsSelector), optionsWithouthField],
                ])
                .run();
        });
    });
});
