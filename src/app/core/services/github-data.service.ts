import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, finalize, map, mergeMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';

import { GithubRepositoryTypes } from '../../shared/constants/github-repository-types';
import { RepositoryWithBranches, Branch, Repository } from '../../shared/interfaces';

import * as mockedRepositories from './repositories-mock.json';

@Injectable({
  providedIn: 'root',
})
export class GithubDataService {
  private githubApiUrl = 'https://api.github.com';

  public isLoading$ = new BehaviorSubject<boolean>(false);
  public errorResponse$ = new BehaviorSubject<HttpErrorResponse | null>(null);

  constructor(private http: HttpClient) { }

  public getUsersRepositoriesWithBranches(username: string): Observable<RepositoryWithBranches[]> {
    this.isLoading$.next(true);

    const params = new HttpParams()
      .set('type', GithubRepositoryTypes.owner);

    // this.isLoading$.next(false);
    // return of(mockedRepositories.default);

    return this.http.get<Repository[]>(`${this.githubApiUrl}/users/${username}/repos`, { params })
      .pipe(
        map(repos => repos.filter(repo => !repo.fork)),
        mergeMap(filteredRepos => {
          return forkJoin(
            filteredRepos.map(repo => {
              const correctBranchesUrl = repo.branches_url.split('{/')[0];
              this.errorResponse$.next(null);

              return this.getBranches(correctBranchesUrl).pipe(
                map(branches => ({
                  ...repo,
                  branches,
                })),
              );
            }),
          );
        }),
        catchError(err => {
          this.errorResponse$.next(err);

          return throwError(err);
        }),
        finalize(() => this.isLoading$.next(false))
      );
  }

  private getBranches(branchesUrl: string): Observable<Branch[]> {
    return this.http.get<Branch[]>(branchesUrl);
  }
}
