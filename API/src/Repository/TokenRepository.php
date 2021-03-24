<?php

namespace App\Repository;

use App\Entity\Token;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @method Token|null find($id, $lockMode = null, $lockVersion = null)
 * @method Token|null findOneBy(array $criteria, array $orderBy = null)
 * @method Token[]    findAll()
 * @method Token[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $manager)
    {
        parent::__construct($registry, Token::class);
        $this->manager = $manager;
    }

    private $manager;

    private function generateToken()
    {
        return str_shuffle("abcdefghijklmnopqrstuvwxyz0123456789" . uniqid());
    }

    public function addToken(User $user): Token
    {
        $token = new Token();

        $token->setToken($this->generateToken());

        $token->setLoginDate(date('Y-m-d H:i:s'));
        $token->setExpiationDate(date(('Y-m-d H:i:s'), time() + 60 * 30));
        $token->setUser($user);
        $user->setToken($token);

        $this->manager->persist($token);
        $this->manager->flush();

        return $token;
    }

    public function removeToken($token): bool
    {
        if ($token !== null) {
            $this->manager->remove($token);
            $this->manager->flush();
            return true;
        }
        return false;
    }
}
